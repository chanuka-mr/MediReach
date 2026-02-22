const Pharmacy = require('../Models/pharmacyModel');

// @desc    Get all pharmacies with pagination and filtering
// @route   GET /api/pharmacies
// @access  Public
exports.getAllPharmacies = async (req, res) => {
  try {
    console.log('📋 Fetching all pharmacies with filters:', req.query);

    // Build query with filters
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Filter active pharmacies by default
    if (!queryObj.isActive) {
      queryObj.isActive = true;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sort = req.query.sort || '-createdAt';

    // Execute query
    const pharmacies = await Pharmacy.find(queryObj)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    // Get total count for pagination
    const total = await Pharmacy.countDocuments(queryObj);

    console.log(`✅ Found ${pharmacies.length} pharmacies (Page ${page} of ${Math.ceil(total/limit)})`);

    res.status(200).json({
      status: 'success',
      results: pharmacies.length,
      data: { 
        pharmacies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching pharmacies:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single pharmacy by ID
// @route   GET /api/pharmacies/:id
// @access  Public
exports.getPharmacyById = async (req, res) => {
  try {
    console.log(`🔍 Fetching pharmacy with ID: ${req.params.id}`);

    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      console.log(`❌ No pharmacy found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacy found with that ID'
      });
    }

    console.log(`✅ Found pharmacy: ${pharmacy.name}`);

    res.status(200).json({
      status: 'success',
      data: { pharmacy }
    });
  } catch (error) {
    console.error('❌ Error fetching pharmacy:', error);
    
    // Handle invalid MongoDB ID
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid pharmacy ID format'
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Search pharmacies by name or district
// @route   GET /api/pharmacies/search
// @access  Public
exports.searchPharmacies = async (req, res) => {
  try {
    const { query, district } = req.query;
    
    console.log(`🔍 Searching pharmacies - query: "${query}", district: "${district}"`);

    let searchQuery = { isActive: true };

    // Build search query
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { pharmacistName: { $regex: query, $options: 'i' } }
      ];
    }

    if (district) {
      searchQuery.district = district;
    }

    const pharmacies = await Pharmacy.find(searchQuery)
      .sort('-createdAt')
      .limit(20); // Limit search results

    console.log(`✅ Search found ${pharmacies.length} pharmacies`);

    res.status(200).json({
      status: 'success',
      results: pharmacies.length,
      data: { pharmacies }
    });
  } catch (error) {
    console.error('❌ Error searching pharmacies:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get pharmacies by district
// @route   GET /api/pharmacies/district/:district
// @access  Public
exports.getPharmaciesByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    
    console.log(`📍 Fetching pharmacies in district: ${district}`);

    const pharmacies = await Pharmacy.find({ 
      district: district,
      isActive: true 
    }).sort('-createdAt');

    console.log(`✅ Found ${pharmacies.length} pharmacies in ${district}`);

    res.status(200).json({
      status: 'success',
      results: pharmacies.length,
      data: { pharmacies }
    });
  } catch (error) {
    console.error('❌ Error fetching pharmacies by district:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new pharmacy
// @route   POST /api/pharmacies
// @access  Public (for now, we'll add auth later)
exports.createPharmacy = async (req, res) => {
  try {
    console.log('📝 Creating pharmacy with data:', req.body);

    // Check if pharmacy exists at same location (within 1km)
    const existingPharmacy = await Pharmacy.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: req.body.location.coordinates
          },
          $maxDistance: 1000 // 1km radius
        }
      }
    });

    if (existingPharmacy) {
      return res.status(409).json({
        status: 'fail',
        message: 'A pharmacy already exists within 1km of this location'
      });
    }

    const pharmacy = await Pharmacy.create(req.body);

    console.log(`✅ Pharmacy created: ${pharmacy.name}`);

    res.status(201).json({
      status: 'success',
      data: { pharmacy }
    });
  } catch (error) {
    console.error('❌ Error creating pharmacy:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        status: 'fail',
        message: `${field} already exists. Please use a different ${field}`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'fail',
        message: errors.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};