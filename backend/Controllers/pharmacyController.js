const Pharmacy = require('../Models/pharmacyModel');
const QRCode = require('qrcode');

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
      'email', 'operatingHours', 'pharmacistName', 'image'
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

// ============= FEATURE 1: NEARBY PHARMACIES =============

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// @desc    Find nearest pharmacies to user's location
// @route   GET /api/pharmacies/nearby?lat=6.9271&lng=79.8612&radius=5
// @access  Public
exports.getNearbyPharmacies = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in km
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide latitude and longitude'
      });
    }

    console.log(`📍 Finding pharmacies near [${lat}, ${lng}] within ${radius}km`);

    // Validate coordinates
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum) || 
        latNum < -90 || latNum > 90 || 
        lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid coordinates provided'
      });
    }

    // Find pharmacies using MongoDB geospatial query
    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lngNum, latNum] // MongoDB expects [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      },
      isActive: true
    }).limit(20);

    // Calculate distance for each pharmacy and add to response
    const pharmaciesWithDistance = pharmacies.map(pharmacy => {
      const distance = calculateDistance(
        latNum, lngNum,
        pharmacy.location.coordinates[1],
        pharmacy.location.coordinates[0]
      );
      
      // Create a plain object with all pharmacy properties plus distance
      const pharmacyObj = pharmacy.toObject();
      pharmacyObj.distance = {
        km: parseFloat(distance.toFixed(2)),
        meters: Math.round(distance * 1000),
        text: `${distance.toFixed(2)} km`
      };
      pharmacyObj.travelTime = {
        car: `${Math.round(distance / 5 * 60)} mins`,
        walk: `${Math.round(distance / 5 * 60 * 3)} mins`, // Walking is ~3x slower than car
        bike: `${Math.round(distance / 15 * 60)} mins` // Bike is ~3x faster than walking
      };
      
      return pharmacyObj;
    });

    // Sort by distance (nearest first)
    pharmaciesWithDistance.sort((a, b) => a.distance.km - b.distance.km);

    res.status(200).json({
      status: 'success',
      results: pharmaciesWithDistance.length,
      data: { 
        pharmacies: pharmaciesWithDistance,
        userLocation: { 
          lat: latNum, 
          lng: lngNum,
          text: `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`
        },
        searchRadius: {
          km: parseFloat(radius),
          meters: radius * 1000
        }
      }
    });
  } catch (error) {
    console.error('❌ Error finding nearby pharmacies:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ============= FEATURE 2: OPEN NOW & 24/7 PHARMACIES =============

// @desc    Get pharmacies that are currently open
// @route   GET /api/pharmacies/open-now
// @access  Public
exports.getOpenNowPharmacies = async (req, res) => {
  try {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMins = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMins}`;
    const currentMinutes = parseInt(currentHours) * 60 + parseInt(currentMins);
    
    console.log(`🕐 Finding pharmacies open at ${currentTime} (${currentMinutes} minutes)`);

    // Get all active pharmacies
    const allPharmacies = await Pharmacy.find({ isActive: true });
    
    // Filter in application level with correct time comparison logic
    const openPharmacies = allPharmacies.filter(pharmacy => {
      const openTime = pharmacy.operatingHours.open;
      const closeTime = pharmacy.operatingHours.close;
      
      // Special case: 24/7 pharmacies always open (open='00:00', close='00:00' or '23:59')
      if (openTime === '00:00' && (closeTime === '00:00' || closeTime === '23:59')) {
        return true;
      }
      
      // Convert time strings to minutes for numeric comparison
      const openMinutes = parseInt(openTime.split(':')[0]) * 60 + parseInt(openTime.split(':')[1]);
      const closeMinutes = parseInt(closeTime.split(':')[0]) * 60 + parseInt(closeTime.split(':')[1]);
      
      if (openMinutes <= closeMinutes) {
        // Regular hours - pharmacy operates within the same day (e.g., 09:00 to 17:00)
        return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
      } else {
        // Crossing midnight - pharmacy operates across two days (e.g., 22:00 to 02:00)
        return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
      }
    });

    console.log(`✅ Found ${openPharmacies.length} pharmacies open now`);

    res.status(200).json({
      status: 'success',
      results: openPharmacies.length,
      data: { 
        pharmacies: openPharmacies,
        currentTime,
        date: now.toDateString()
      }
    });
  } catch (error) {
    console.error('❌ Error finding open pharmacies:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get 24/7 pharmacies
// @route   GET /api/pharmacies/24-7
// @access  Public
exports.get247Pharmacies = async (req, res) => {
  try {
    console.log('🕛 Finding 24/7 pharmacies');

    // 24/7 pharmacies have open='00:00' (midnight) and close='00:00' or '23:59'
    // representing they operate the entire day continuously
    const pharmacies = await Pharmacy.find({
      isActive: true,
      'operatingHours.open': '00:00',
      $or: [
        { 'operatingHours.close': '00:00' },
        { 'operatingHours.close': '23:59' }
      ]
    });

    console.log(`✅ Found ${pharmacies.length} pharmacies open 24/7`);

    res.status(200).json({
      status: 'success',
      results: pharmacies.length,
      data: { pharmacies }
    });
  } catch (error) {
    console.error('❌ Error finding 24/7 pharmacies:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ============= FEATURE 3: ANALYTICS & STATISTICS =============

// @desc    Get pharmacy statistics dashboard
// @route   GET /api/pharmacies/stats
// @access  Public
exports.getPharmacyStats = async (req, res) => {
  try {
    console.log('📊 Generating pharmacy statistics');

    // Stats by district
    const byDistrict = await Pharmacy.aggregate([
      {
        $group: {
          _id: '$district',
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Total counts
    const total = await Pharmacy.countDocuments();
    const active = await Pharmacy.countDocuments({ isActive: true });
    const inactive = total - active;

    // Recently added (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = await Pharmacy.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Operating hours analysis
    const morningPharmacies = await Pharmacy.countDocuments({
      'operatingHours.open': { $lte: '08:00' }
    });
    
    const nightPharmacies = await Pharmacy.countDocuments({
      'operatingHours.close': { $gte: '22:00' }
    });

    const twentyFourSeven = await Pharmacy.countDocuments({
      $or: [
        { 'operatingHours.open': '00:00', 'operatingHours.close': '23:59' },
        { 'operatingHours.open': '00:00', 'operatingHours.close': '00:00' }
      ]
    });

    // Get total number of unique districts
    const districts = await Pharmacy.distinct('district');
    
    // Get pharmacy with most recent update
    const latestUpdate = await Pharmacy.findOne().sort('-updatedAt');

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          total,
          active,
          inactive,
          activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) + '%' : '0%',
          inactivePercentage: total > 0 ? ((inactive / total) * 100).toFixed(1) + '%' : '0%',
          totalDistricts: districts.length,
          recentAdditions: recent
        },
        byDistrict: byDistrict.map(item => ({
          district: item._id,
          total: item.total,
          active: item.active,
          inactive: item.inactive,
          occupancyRate: ((item.active / item.total) * 100).toFixed(1) + '%'
        })),
        operatingHours: {
          opensEarly: morningPharmacies,
          closesLate: nightPharmacies,
          twentyFourSeven: twentyFourSeven,
          regularHours: total - (morningPharmacies + nightPharmacies + twentyFourSeven)
        },
        metadata: {
          latestUpdate: latestUpdate ? {
            name: latestUpdate.name,
            updatedAt: latestUpdate.updatedAt
          } : null,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('❌ Error generating stats:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Bulk update pharmacies
// @route   PATCH /api/pharmacies/bulk-update
// @access  Public (Admin only for production)
exports.bulkUpdatePharmacies = async (req, res) => {
  try {
    const { pharmacyIds, updateData } = req.body;

    if (!pharmacyIds || !Array.isArray(pharmacyIds) || pharmacyIds.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of pharmacy IDs'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide update data'
      });
    }

    console.log(`📦 Bulk updating ${pharmacyIds.length} pharmacies`);

    const result = await Pharmacy.updateMany(
      { _id: { $in: pharmacyIds } },
      updateData,
      { runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: `Updated ${result.modifiedCount} pharmacies`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        updateData
      }
    });
  } catch (error) {
    console.error('❌ Error bulk updating:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Export pharmacies as CSV
// @route   GET /api/pharmacies/export/csv
// @access  Public
exports.exportPharmaciesCSV = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ isActive: true });

    // Create CSV header
    let csv = 'Name,District,Contact,Email,Pharmacist,Open,Close,Status\n';

    // Add rows
    pharmacies.forEach(p => {
      csv += `"${p.name}",${p.district},${p.contactNumber},${p.email},${p.pharmacistName},${p.operatingHours.open},${p.operatingHours.close},${p.isActive ? 'Active' : 'Inactive'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=pharmacies.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('❌ Error exporting CSV:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};



// @desc    Generate QR code for pharmacy
// @route   GET /api/pharmacies/:id/qrcode
// @access  Public
exports.generatePharmacyQR = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        status: 'fail',
        message: 'No pharmacy found with that ID'
      });
    }

    // Create QR code data
    const qrData = {
      id: pharmacy._id,
      name: pharmacy.name,
      district: pharmacy.district,
      contact: pharmacy.contactNumber,
      location: pharmacy.location.coordinates,
      website: `http://localhost:5000/api/pharmacies/${pharmacy._id}`
    };

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    res.status(200).json({
      status: 'success',
      data: {
        pharmacy: pharmacy.name,
        qrCode: qrCode,
        scanUrl: `http://localhost:5000/api/pharmacies/${pharmacy._id}`
      }
    });
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

