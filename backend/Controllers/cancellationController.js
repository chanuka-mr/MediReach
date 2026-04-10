const RequestCancellation = require('../Model/RequestCancellation');

// Create a cancellation
const createCancellation = async (req, res, next) => {
    try {
        const cancellation = await RequestCancellation.create(req.body);
        res.status(201).json(cancellation);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Get all cancellations
const getAllCancellations = async (req, res, next) => {
    try {
        const cancellations = await RequestCancellation.find({}).sort({ createdAt: -1 });
        res.json(cancellations);
    } catch (error) {
        next(error);
    }
};

// Get a single cancellation by ID
const getCancellationById = async (req, res, next) => {
    try {
        const cancellation = await RequestCancellation.findById(req.params.id);
        if (!cancellation) {
            res.status(404);
            throw new Error('Cancellation not found');
        }
        res.json(cancellation);
    } catch (error) {
        next(error);
    }
};

// Update a cancellation
const updateCancellation = async (req, res, next) => {
    try {
        const cancellation = await RequestCancellation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!cancellation) {
            res.status(404);
            throw new Error('Cancellation not found');
        }
        res.json(cancellation);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Delete a cancellation
const deleteCancellation = async (req, res, next) => {
    try {
        const cancellation = await RequestCancellation.findByIdAndDelete(req.params.id);
        if (!cancellation) {
            res.status(404);
            throw new Error('Cancellation not found');
        }
        res.json({ message: 'Cancellation deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCancellation,
    getAllCancellations,
    getCancellationById,
    updateCancellation,
    deleteCancellation
};
