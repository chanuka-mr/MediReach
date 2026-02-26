const express = require('express');
const router = express.Router();
const {
    createRouting,
    getAllRoutings,
    getRoutingById,
    updateRouting,
    deleteRouting
} = require('../Controllers/routingController');

router.post('/', createRouting);
router.get('/', getAllRoutings);
router.get('/:id', getRoutingById);
router.put('/:id', updateRouting);
router.delete('/:id', deleteRouting);

module.exports = router;
