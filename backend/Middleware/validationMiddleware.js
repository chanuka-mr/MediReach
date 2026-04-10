const Joi = require('joi');

const validateRequest = (schema) => {
    return (req, res, next) => {
        // Skip validation for multipart/form-data (file uploads)
        // FormData objects don't work with Joi validation
        if (req.is('multipart/form-data')) {
            return next();
        }
        
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            res.status(400);
            throw new Error(`Validation Error: ${errorMessages.join(', ')}`);
        }
        next();
    };
};

// Custom validation for prescription image requirement
const validatePrescriptionImage = (req, res, next) => {
    try {
        let medicines = [];
        
        // Parse medicines from FormData
        if (req.body.medicines) {
            try {
                medicines = JSON.parse(req.body.medicines);
            } catch (error) {
                medicines = [];
            }
        }
        
        // Check if any medicine requires prescription
        const requiresPrescription = medicines.some(med => 
            med.mediPrescriptionStatus && med.mediPrescriptionStatus.toLowerCase() === 'required'
        );
        
        // If any medicine requires prescription, check if image is uploaded
        if (requiresPrescription && !req.file) {
            return res.status(400).json({ 
                message: 'Prescription image is required for one or more medicines in your order' 
            });
        }
        
        // If no medicines require prescription, image is optional
        next();
    } catch (error) {
        console.error('Prescription validation error:', error);
        next();
    }
};

// Validation Schemas
const schemas = {
    createMedRequest: Joi.object({
        patient_id: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        pharmacy_id: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        priority_level: Joi.string().valid('Normal', 'Urgent', 'Emergency'),
        notes: Joi.string().allow(''),
        prescription_image: Joi.string().allow(''),
        expiry_time: Joi.date().greater('now').optional(),
        preferred_pharmacy_id: Joi.string().optional(),
        medicines: Joi.string().optional() // Allow medicines as JSON string from FormData
    }),
    processAction: Joi.object({
        action: Joi.string().valid('Approve', 'Reject', 'Ready', 'dispatch', 'accept', 'payment', 'payment-verified').required(),
        pharmacy_id: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        notes: Joi.string().allow(''),
        rejectionReason: Joi.string().allow(''),
        reason: Joi.string().allow('')
    }),
    cancelRequest: Joi.object({
        reason: Joi.string().required()
    })
};

module.exports = { validateRequest, validatePrescriptionImage, schemas };
