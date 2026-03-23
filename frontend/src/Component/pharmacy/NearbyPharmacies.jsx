import React from 'react';
import PharmacyListView from './PharmacyListView';

const NearbyPharmacies = () => {
  return (
    <PharmacyListView 
      title="Nearby Pharmacies" 
      subTitle="Pharmacies near your current location (10km radius)" 
      type="nearby" 
    />
  );
};

export default NearbyPharmacies;
