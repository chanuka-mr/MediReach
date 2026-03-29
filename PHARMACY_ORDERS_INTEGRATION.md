# Pharmacy Orders Integration

## Overview
The Pharmacy Orders page now supports filtering orders by specific pharmacy when accessed from the Inventory Dashboard.

## How It Works

### 1. Inventory Dashboard Integration
- **Location**: `frontend/src/Component/InventoryDashboard.js` (line 291)
- **Action**: Click the "Orders" button for any pharmacy
- **Navigation**: `/orders?pharmacy=${encodeURIComponent(pharmacy.name)}`
- **Example**: `/orders?pharmacy=Gampaha%20Pharmacy`

### 2. Pharmacy Orders Component
- **Location**: `frontend/src/Component/PharmacyOrders.js`
- **Feature**: Reads `pharmacy` URL parameter and filters orders accordingly
- **URL Parsing**: `new URLSearchParams(location.search).get("pharmacy")`

### 3. User Experience Features

#### When Pharmacy-Specific View:
- **Breadcrumb**: Shows "Inventory → Orders → [Pharmacy Name]"
- **Title**: "Pharmacy Orders" instead of "Order Management"
- **Description**: "Showing orders for [Pharmacy Name]"
- **Stats**: Filtered to show only that pharmacy's orders
- **Back Button**: "Back to all orders" clears the filter

#### When All Orders View:
- **Breadcrumb**: Shows "Inventory → Orders"
- **Title**: "Order Management"
- **Description**: General order management text
- **Stats**: Shows stats for all orders
- **No Back Button**: Not needed since already showing all

## Technical Implementation

### URL Parameter Handling
```javascript
// Read pharmacy from URL
const urlParams = new URLSearchParams(location.search);
const urlPharmacy = urlParams.get("pharmacy") || "";

// Set filter from URL
const [pharmFilter, setPharmFilter] = useState(urlPharmacy);

// Sync when URL changes
useEffect(() => {
  setPharmFilter(urlPharmacy);
  setPage(1);
}, [urlPharmacy]);
```

### Order Filtering Logic
```javascript
const filtered = orderData.filter(order => 
  // Search filter
  (order.pharmacy.toLowerCase().includes(search.toLowerCase()) ||
   order.medicine.toLowerCase().includes(search.toLowerCase())) &&
  // Pharmacy filter
  (pharmFilter === "" || pharmFilter === "All" || order.pharmacy === pharmFilter) &&
  // Other filters...
);
```

### Navigation Back to All Orders
```javascript
const clearPharmacyFilter = () => {
  setPharmFilter("All");
  setPage(1);
  navigate("/orders", { replace: true });
};
```

## Available Pharmacies
Currently active pharmacies in the database:
- Gampaha Pharmacy (Gampaha)
- Test Pharmacy 2 (Gampaha)  
- Uduwella (Colombo)
- MediReach (Colombo)

## Example URLs
- **All Orders**: `/orders`
- **Gampaha Pharmacy Orders**: `/orders?pharmacy=Gampaha%20Pharmacy`
- **Uduwella Orders**: `/orders?pharmacy=Uduwella`

## Benefits
1. **Contextual Navigation**: Users can drill down from pharmacy to specific orders
2. **Filtered Stats**: See order statistics for individual pharmacies
3. **Clear Breadcrumbs**: Always know where you are in the navigation
4. **Easy Navigation**: Quick return to all orders view
5. **URL Shareability**: Direct links to specific pharmacy orders

## Testing
Run the test script to verify pharmacy data:
```bash
cd backend
node testPharmacyOrders.js
```

## Files Modified
- `frontend/src/Component/InventoryDashboard.js` - Updated Orders button navigation
- `frontend/src/Component/PharmacyOrders.js` - Already had full filtering support

## Files Created
- `backend/testPharmacyOrders.js` - Test script for pharmacy orders integration
- `PHARMACY_ORDERS_INTEGRATION.md` - This documentation file
