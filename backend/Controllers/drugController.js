const drugService = require('../Services/drugService');

const getDrugDetails = async (req, res, next) => {
    try {
        const { name } = req.params;
        const drugInfo = await drugService.getDrugInfo(name);

        if (!drugInfo) {
            return res.status(404).json({ message: 'Drug information not found' });
        }

        res.json(drugInfo);
    } catch (error) {
        res.status(500);
        next(error);
    }
};

module.exports = { getDrugDetails };
