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

// ============= UPDATE OPERATIONS =============

// @desc    Update pharmacy by ID (FULL update)
// @route   PUT /api/pharmacies/:id
// @access  Public (for now, we'll add auth later)
exports.updatePharmacy = async (req, res) => {
  try {
    console.log(`✏️ Updating pharmacy with ID: ${req.params.id}`);
    console.log('📝 Update data:', req.body);

    // Find the pharmacy first
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      console.log(`❌ No pharmacy found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacy found with that ID'
      });
    }

    // Prevent updating certain fields
    const allowedUpdates = [
      'name', 'district', 'location', 'contactNumber', 
      'email', 'operatingHours', 'pharmacistName'
    ];
    
    // Filter out fields that are not allowed to be updated
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // If location is being updated, check if new location is available
    if (updateData.location && updateData.location.coordinates) {
      // Check if another pharmacy exists at this new location
      const existingPharmacy = await Pharmacy.findOne({
        _id: { $ne: req.params.id }, // Exclude current pharmacy
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: updateData.location.coordinates
            },
            $maxDistance: 1000 // 1km radius
          }
        }
      });

      if (existingPharmacy) {
        return res.status(409).json({
          status: 'fail',
          message: 'Another pharmacy already exists within 1km of this location'
        });
      }
    }

    // Update the pharmacy
    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validations
      }
    );

    console.log(`✅ Pharmacy updated successfully: ${updatedPharmacy.name}`);

    res.status(200).json({
      status: 'success',
      data: { pharmacy: updatedPharmacy }
    });

  } catch (error) {
    console.error('❌ Error updating pharmacy:', error);

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

// @desc    Partially update pharmacy (PATCH)
// @route   PATCH /api/pharmacies/:id
// @access  Public (for now, we'll add auth later)
exports.partiallyUpdatePharmacy = async (req, res) => {
  try {
    console.log(`🔧 Partially updating pharmacy with ID: ${req.params.id}`);
    console.log('📝 Update data:', req.body);

    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacy found with that ID'
      });
    }

    // If location is being updated, check location availability
    if (req.body.location && req.body.location.coordinates) {
      const existingPharmacy = await Pharmacy.findOne({
        _id: { $ne: req.params.id },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: req.body.location.coordinates
            },
            $maxDistance: 1000
          }
        }
      });

      if (existingPharmacy) {
        return res.status(409).json({
          status: 'fail',
          message: 'Another pharmacy already exists within 1km of this location'
        });
      }
    }

    // Only update fields that are provided
    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true
      }
    );

    console.log(`✅ Pharmacy partially updated: ${updatedPharmacy.name}`);

    res.status(200).json({
      status: 'success',
      data: { pharmacy: updatedPharmacy }
    });

  } catch (error) {
    console.error('❌ Error partially updating pharmacy:', error);
    
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

// @desc    Toggle pharmacy active status
// @route   PATCH /api/pharmacies/:id/toggle-status
// @access  Public (for now, we'll add auth later)
exports.togglePharmacyStatus = async (req, res) => {
  try {
    console.log(`🔄 Toggling status for pharmacy ID: ${req.params.id}`);

    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacy found with that ID'
      });
    }

    // Toggle the isActive status
    pharmacy.isActive = !pharmacy.isActive;
    await pharmacy.save();

    const status = pharmacy.isActive ? 'activated' : 'deactivated';
    console.log(`✅ Pharmacy ${status}: ${pharmacy.name}`);

    res.status(200).json({
      status: 'success',
      message: `Pharmacy ${status} successfully`,
      data: { 
        isActive: pharmacy.isActive,
        pharmacy 
      }
    });

  } catch (error) {
    console.error('❌ Error toggling pharmacy status:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ============= DELETE OPERATIONS =============

// @desc    Delete pharmacy permanently (HARD DELETE)
// @route   DELETE /api/pharmacies/:id
// @access  Public (for now, we'll add auth later - Admin only)
exports.deletePharmacyPermanently = async (req, res) => {
  try {
    console.log(`🗑️ Permanently deleting pharmacy with ID: ${req.params.id}`);

    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      console.log(`❌ No pharmacy found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacy found with that ID'
      });
    }

    // Store pharmacy name for response message
    const pharmacyName = pharmacy.name;

    // Permanently delete from database
    await Pharmacy.findByIdAndDelete(req.params.id);

    console.log(`✅ Pharmacy permanently deleted: ${pharmacyName}`);

    res.status(200).json({
      status: 'success',
      message: `Pharmacy '${pharmacyName}' has been permanently deleted`,
      data: null
    });

  } catch (error) {
    console.error('❌ Error deleting pharmacy:', error);

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

// @desc    Soft delete pharmacy (just mark as inactive)
// @route   DELETE /api/pharmacies/:id/soft
// @access  Public (for now, we'll add auth later)
exports.softDeletePharmacy = async (req, res) => {
  try {
    console.log(`📌 Soft deleting pharmacy with ID: ${req.params.id}`);

    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      console.log(`❌ No pharmacy found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacy found with that ID'
      });
    }

    // Check if already inactive
    if (!pharmacy.isActive) {
      return res.status(400).json({
        status: 'fail',
        message: 'Pharmacy is already inactive'
      });
    }

    // Mark as inactive (soft delete)
    pharmacy.isActive = false;
    await pharmacy.save();

    console.log(`✅ Pharmacy soft deleted: ${pharmacy.name}`);

    res.status(200).json({
      status: 'success',
      message: `Pharmacy '${pharmacy.name}' has been deactivated (soft delete)`,
      data: {
        pharmacy: {
          id: pharmacy._id,
          name: pharmacy.name,
          isActive: pharmacy.isActive
        }
      }
    });

  } catch (error) {
    console.error('❌ Error soft deleting pharmacy:', error);

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

// @desc    Restore soft-deleted pharmacy
// @route   PATCH /api/pharmacies/:id/restore
// @access  Public (for now, we'll add auth later)
exports.restorePharmacy = async (req, res) => {
  try {
    console.log(`🔄 Restoring pharmacy with ID: ${req.params.id}`);

    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      console.log(`❌ No pharmacy found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacy found with that ID'
      });
    }

    // Check if already active
    if (pharmacy.isActive) {
      return res.status(400).json({
        status: 'fail',
        message: 'Pharmacy is already active'
      });
    }

    // Restore by marking as active
    pharmacy.isActive = true;
    await pharmacy.save();

    console.log(`✅ Pharmacy restored: ${pharmacy.name}`);

    res.status(200).json({
      status: 'success',
      message: `Pharmacy '${pharmacy.name}' has been restored`,
      data: {
        pharmacy: {
          id: pharmacy._id,
          name: pharmacy.name,
          isActive: pharmacy.isActive
        }
      }
    });

  } catch (error) {
    console.error('❌ Error restoring pharmacy:', error);

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

// @desc    Delete multiple pharmacies (bulk delete)
// @route   POST /api/pharmacies/bulk-delete
// @access  Public (for now, we'll add auth later - Admin only)
exports.bulkDeletePharmacies = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of pharmacy IDs to delete'
      });
    }

    console.log(`🗑️ Bulk deleting ${ids.length} pharmacies`);

    // Find all pharmacies to delete
    const pharmacies = await Pharmacy.find({ _id: { $in: ids } });
    
    if (pharmacies.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacies found with the provided IDs'
      });
    }

    // Store names for response
    const deletedNames = pharmacies.map(p => p.name);

    // Delete all matching pharmacies
    const result = await Pharmacy.deleteMany({ _id: { $in: ids } });

    console.log(`✅ Successfully deleted ${result.deletedCount} pharmacies`);

    res.status(200).json({
      status: 'success',
      message: `Successfully deleted ${result.deletedCount} pharmacies`,
      data: {
        deletedCount: result.deletedCount,
        deletedPharmacies: deletedNames
      }
    });

  } catch (error) {
    console.error('❌ Error bulk deleting pharmacies:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};