const mongoose = require('mongoose');
const MedicationRequest = require('./Model/MedicationRequest');
require('dotenv').config();

const fixUnderscores = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await MedicationRequest.updateMany(
            { pharmacy_id: 'PHARM_001' },
            { pharmacy_id: 'PHARM-001' }
        );
        console.log(`Updated ${result.modifiedCount} orders (underscore to hyphen)`);
        
        const result2 = await MedicationRequest.updateMany(
            { pharmacy_id: { $exists: false } },
            { pharmacy_id: 'PHARM-001' }
        );
         console.log(`Updated ${result2.modifiedCount} orders (missing to PHARM-001)`);

        process.exit();
    } catch (error) {
        process.exit(1);
    }
};

fixUnderscores();
