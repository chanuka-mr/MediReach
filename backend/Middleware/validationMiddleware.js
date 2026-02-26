const Joi = require('joi');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            res.status(400);
            throw new Error(`Validation Error: ${errorMessages.join(', ')}`);
        }
        next();
    };
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
        preferred_pharmacy_id: Joi.string().optional()
    }),
    processAction: Joi.object({
        action: Joi.string().valid('Approve', 'Reject').required(),
        notes: Joi.string().allow('')
    }),
    cancelRequest: Joi.object({
        reason: Joi.string().required()
    })
};

module.exports = { validateRequest, schemas };
