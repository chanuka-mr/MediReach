const RequestRouting = require('../Model/RequestRouting');

// Create a routing entry
const createRouting = async (req, res, next) => {
    try {
        const routing = await RequestRouting.create(req.body);
        res.status(201).json(routing);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Get all routing entries
const getAllRoutings = async (req, res, next) => {
    try {
        const routings = await RequestRouting.find({}).sort({ createdAt: -1 });
        res.json(routings);
    } catch (error) {
        next(error);
    }
};

// Get a single routing entry by ID
const getRoutingById = async (req, res, next) => {
    try {
        const routing = await RequestRouting.findById(req.params.id);
        if (!routing) {
            res.status(404);
            throw new Error('Routing entry not found');
        }
        res.json(routing);
    } catch (error) {
        next(error);
    }
};

// Update a routing entry
const updateRouting = async (req, res, next) => {
    try {
        const routing = await RequestRouting.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!routing) {
            res.status(404);
            throw new Error('Routing entry not found');
        }
        res.json(routing);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// Delete a routing entry
const deleteRouting = async (req, res, next) => {
    try {
        const routing = await RequestRouting.findByIdAndDelete(req.params.id);
        if (!routing) {
            res.status(404);
            throw new Error('Routing entry not found');
        }
        res.json({ message: 'Routing entry deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRouting,
    getAllRoutings,
    getRoutingById,
    updateRouting,
    deleteRouting
};
