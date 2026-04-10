const axios = require('axios');

/**
 * Component 4: Drug Information Service (Third-party API)
 * Using OpenFDA API to fetch drug details
 */
const getDrugInfo = async (drugName) => {
    try {
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${drugName}&limit=1`);

        if (response.data.results && response.data.results.length > 0) {
            const drug = response.data.results[0];
            return {
                brand_name: drug.openfda.brand_name ? drug.openfda.brand_name[0] : drugName,
                generic_name: drug.openfda.generic_name ? drug.openfda.generic_name[0] : 'N/A',
                indications: drug.indications_and_usage ? drug.indications_and_usage[0] : 'No data available',
                dosage: drug.dosage_and_administration ? drug.dosage_and_administration[0] : 'No data available',
                warnings: drug.warnings ? drug.warnings[0] : 'No data available'
            };
        }
        return null;
    } catch (error) {
        console.error('OpenFDA API Error:', error.message);
        throw new Error('Failed to fetch drug information from third-party API');
    }
};

module.exports = { getDrugInfo };
