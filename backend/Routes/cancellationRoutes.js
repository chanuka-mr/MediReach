const express = require('express');
const router = express.Router();
const {
    createCancellation,
    getAllCancellations,
    getCancellationById,
    updateCancellation,
    deleteCancellation
} = require('../Controllers/cancellationController');

router.post('/', createCancellation);
router.get('/', getAllCancellations);
router.get('/:id', getCancellationById);
router.put('/:id', updateCancellation);
router.delete('/:id', deleteCancellation);

module.exports = router;
