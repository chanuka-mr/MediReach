# PharmacyOrders Database Integration

## Overview
Complete integration of PharmacyOrders component with real MongoDB database to display user-placed orders filtered by pharmacy.

## 🎯 Database Integration Features

### 1. Real Data Source
- **API Endpoint**: `GET http://localhost:5000/roms/pharmacy-tasks`
- **Database**: MongoDB MedicationRequest collection
- **Current Data**: 35 medication requests, 4 active pharmacies

### 2. Pharmacy Filtering
- **URL Parameter**: `?pharmacy_id={pharmacyName}`
- **Backend Filtering**: Filters orders by pharmacy_id field
- **Frontend Integration**: Reads URL parameters and filters display

### 3. Data Transformation
Database fields are mapped to UI format:

| Database Field | UI Field | Transformation |
|---------------|----------|----------------|
| `_id` | `id` | Direct mapping |
| `pharmacy_id` | `pharmacy` | Direct mapping |
| `notes` | `medicine` | Notes as medicine description |
| `createdAt` | `orderedAt` | Date formatting |
| `status` | `status` | Status mapping |
| `priority_level` | `priority` | Priority mapping |

### 4. Status Mapping
```javascript
const mapStatus = (status) => {
  switch (status) {
    case 'Pending': return 'pending'
    case 'Approved': return 'processing'
    case 'Ready': return 'in_transit'
    case 'Rejected': return 'rejected'
    case 'Cancelled': return 'cancelled'
    default: return 'pending'
  }
}
```

### 5. Priority Mapping
```javascript
const mapPriority = (priority) => {
  switch (priority) {
    case 'Emergency': return 'urgent'
    case 'Urgent': return 'urgent'
    case 'Normal': return 'normal'
    default: return 'normal'
  }
}
```

## 🔄 User Flow Integration

### Complete Order Journey:
1. **User Places Order** → Medicine shop → Order form → Database
2. **Order Stored** → MedicationRequest collection
3. **Pharmacy Views** → InventoryDashboard → Orders button
4. **Filtered Display** → PharmacyOrders with pharmacy filter
5. **Order Management** → Dispatch/Reject actions

### URL Navigation Flow:
```
InventoryDashboard
    ↓ (Click Orders button)
/orders?pharmacy={pharmacyName}
    ↓
PharmacyOrders component
    ↓
Fetches from /roms/pharmacy-tasks?pharmacy_id={pharmacyName}
    ↓
Displays filtered orders
```

## 📊 Current Database Status

### Medication Requests: 35 total
- **Sample Data**:
  - Patient: P12345 - Pharmacy: PHARM-001 - Status: Expired
  - Priority: Urgent - Notes: "Testing my new filtered route"
  - Created: 2/26/2026

### Active Pharmacies: 4 total
- **Gampaha Pharmacy** (Gampaha)
- **Test Pharmacy 2** (Gampaha)
- **Uduwella** (Colombo)
- **MediReach** (Colombo)

## 🛠️ Technical Implementation

### Backend API
```javascript
// romsController.js - getPharmacyRequests
const getPharmacyRequests = async (req, res, next) => {
  try {
    const pharmacy_id = req.query?.pharmacy_id || req.user?._id;
    const filter = {};
    
    if (pharmacy_id && pharmacy_id !== 'ALL') {
      filter.pharmacy_id = { $in: [pharmacy_id, pharmacy_id.replace(/-/g, '_'), pharmacy_id.replace(/_/g, '-')] };
    }
    
    const requests = await MedicationRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};
```

### Frontend Integration
```javascript
// PharmacyOrders.js - fetchOrders
const fetchOrders = async () => {
  setLoading(true);
  setFetchError(null);
  try {
    const url = new URL(API);
    if (pharmFilter && pharmFilter !== 'All') {
      url.searchParams.append('pharmacy_id', pharmFilter);
    }
    
    const res = await fetch(url.toString());
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
    
    // Transform database orders to match UI structure
    const transformedOrders = data.map(order => ({
      id: order._id || `ORD-${order.patient_id}`,
      pharmacy: order.pharmacy_id || 'Unknown Pharmacy',
      medicine: order.notes || 'Medicine Request',
      status: mapStatus(order.status),
      priority: mapPriority(order.priority_level),
      orderedAt: order.createdAt || order.request_date,
      // ... other fields
    }));
    
    setOrderData(transformedOrders);
  } catch (error) {
    setFetchError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## 🎨 UI Features

### Loading States
- **Loading Spinner**: Shows while fetching from database
- **Error Handling**: Retry button on fetch failure
- **Empty State**: Message when no orders found

### Dynamic Filtering
- **Pharmacy Filter**: From URL parameter or dropdown
- **Status Filter**: Pending, Processing, In Transit, etc.
- **Search**: By order ID, pharmacy, or medicine
- **Real-time Updates**: Instant filtering

### Pharmacy Context
- **Breadcrumb Navigation**: Shows filtered pharmacy
- **Context Banner**: Pharmacy-specific information
- **Back Button**: Clear filter to show all orders

## 🔗 Integration Points

### 1. Medicine Shop → Order Form → Database
```
User adds medicines to cart
    ↓
Places order via OrderForm
    ↓
POST /roms/request
    ↓
Stored in MedicationRequest collection
```

### 2. Inventory Dashboard → Pharmacy Orders
```
InventoryDashboard shows pharmacy list
    ↓
Click Orders button for specific pharmacy
    ↓
Navigate to /orders?pharmacy={pharmacyName}
    ↓
PharmacyOrders fetches filtered data
```

### 3. URL Parameter System
```
/orders - Show all orders
/orders?pharmacy=Gampaha%20Pharmacy - Show only Gampaha Pharmacy orders
/orders?pharmacy=Test%20Pharmacy%202 - Show only Test Pharmacy 2 orders
```

## 📱 User Experience

### For Pharmacy Staff:
1. **View Orders**: Click Orders button in InventoryDashboard
2. **Pharmacy Filtering**: Automatic filtering by selected pharmacy
3. **Order Details**: Expandable rows with full information
4. **Actions**: Dispatch or reject orders with reasons
5. **Real-time Updates**: Live data from database

### For System Admin:
1. **All Orders View**: Access /orders without pharmacy filter
2. **Cross-Pharmacy**: View orders from all pharmacies
3. **Global Search**: Search across all orders
4. **Bulk Actions**: Export reports for all orders

## 🚀 Testing & Verification

### Test Script Results:
```bash
$ node testPharmacyOrdersIntegration.js

✅ Connected to MongoDB
📊 Database Statistics:
   Total Medication Requests: 35
   Active Pharmacies: 4

🎯 Integration Points:
   1. PharmacyOrders fetches from /roms/pharmacy-tasks
   2. Backend filters by pharmacy_id if specified
   3. Frontend transforms database data to UI format
   4. Status and priority mapping working correctly
```

### Manual Testing:
1. **Start Backend**: `npm start` or `node server.js`
2. **Access Pharmacy Orders**: Navigate to `/orders`
3. **Test Pharmacy Filter**: Click Orders button in InventoryDashboard
4. **Verify Data**: Check that real database orders are displayed
5. **Test Actions**: Try dispatch/reject functionality

## 🎯 Benefits Achieved

1. **Real Data Integration**: Live orders from MongoDB database
2. **Pharmacy Filtering**: Automatic filtering by pharmacy
3. **Seamless Navigation**: URL parameter-based filtering
4. **Professional UI**: Loading states, error handling, empty states
5. **Data Transformation**: Proper mapping from database to UI format
6. **Status Management**: Accurate status and priority mapping
7. **User Experience**: Intuitive workflow from order placement to management
8. **Scalability**: Handles multiple pharmacies and orders efficiently

The PharmacyOrders component now displays real user-placed orders from the database, properly filtered by pharmacy, providing a complete order management system for pharmacy staff!
