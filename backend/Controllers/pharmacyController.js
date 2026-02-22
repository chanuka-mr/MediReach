const Pharmacy = require('../Models/pharmacyModel');

// @desc    Get all pharmacies
// @route   GET /api/pharmacies
// @access  Public
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.status(200).json({
      status: 'success',
      results: pharmacies.length,
      data: { pharmacies }
    });
  } catch (error) {
    console.error('❌ Error fetching pharmacies:', error);
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