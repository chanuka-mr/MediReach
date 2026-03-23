import React from 'react';
import PharmacyListView from './PharmacyListView';

const OpenNowPharmacies = () => {
  return (
    <PharmacyListView 
      title="Open Now" 
      subTitle="Pharmacies currently open and ready to serve" 
      type="open-now" 
    />
  );
};

export default OpenNowPharmacies;
