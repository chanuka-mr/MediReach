// Shared pharmacy service for fetching registered pharmacies from MongoDB
const API_BASE = 'http://localhost:5000';

// Fetch all registered pharmacies from database
export const fetchRegisteredPharmacies = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/pharmacies`);
    const data = await res.json();
    
    if (res.ok) {
      console.log('Pharmacies API response from MongoDB:', data);
      
      // Extract pharmacy names from MongoDB response
      let pharmacyNames = [];
      
      if (Array.isArray(data)) {
        // Direct array response from MongoDB
        pharmacyNames = data.map(p => p.name || p.pharmacyName || p.pharmacy).filter(Boolean);
      } else if (data.pharmacies && Array.isArray(data.pharmacies)) {
        // Response with pharmacies property
        pharmacyNames = data.pharmacies.map(p => p.name || p.pharmacyName || p.pharmacy).filter(Boolean);
      } else if (data.data && Array.isArray(data.data)) {
        // Response with data property
        pharmacyNames = data.data.map(p => p.name || p.pharmacyName || p.pharmacy).filter(Boolean);
      } else if (data.results && Array.isArray(data.results)) {
        // Response with results property
        pharmacyNames = data.results.map(p => p.name || p.pharmacyName || p.pharmacy).filter(Boolean);
      }
      
      console.log('Extracted pharmacy names from MongoDB:', pharmacyNames);
      return pharmacyNames;
    } else {
      console.error('Failed to fetch pharmacies from MongoDB:', data.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Error fetching pharmacies from MongoDB:', error);
    return [];
  }
};

// Get pharmacy dashboard stats (same as PharmacyDashboard)
export const fetchPharmacyStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/pharmacies`);
    const data = await response.json();
    
    if (response.ok) {
      const pharmacies = data.data?.pharmacies || [];
      const active = pharmacies.filter(p => p.isActive).length;
      const inactive = pharmacies.filter(p => !p.isActive).length;
      const districts = [...new Set(pharmacies.map(p => p.district))];

      return {
        totalPharmacies: pharmacies.length,
        activePharmacies: active,
        inactivePharmacies: inactive,
        totalDistricts: districts.length,
        pharmaciesList: pharmacies
      };
    } else {
      throw new Error(data.message || 'Failed to fetch pharmacy statistics');
    }
  } catch (err) {
    console.error('Error fetching pharmacy stats:', err);
    throw new Error('Failed to load pharmacy statistics');
  }
};
