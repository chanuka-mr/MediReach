# MedicationRequest Table Integration

## 🎯 Overview
The PharmacyOrders page now correctly uses the **MedicationRequest** table from the database and filters orders by **pharmacy_id** field, providing real-time order management for pharmacies.

## 📊 Database Structure

### MedicationRequest Collection
```javascript
{
  _id: ObjectId,
  patient_id: String,           // Patient identifier
  pharmacy_id: String,         // Pharmacy name (filter field)
  request_date: Date,          // When request was made
  status: String,              // Order status
  priority_level: String,      // Priority level
  expiry_time: Date,           // Request expiry
  notes: String,               // Medicine/dosage notes
  prescription_image: String,  // Image URL
  createdAt: Date,             // Record creation
  updatedAt: Date,             // Record update
  __v: Number                  // Version
}
```

### Status Values
- `Pending` - New order awaiting processing
- `Approved` - Order approved by pharmacy
- `Ready` - Order ready for pickup/delivery
- `Rejected` - Order rejected
- `Expired` - Order expired
- `Cancelled` - Order cancelled

### Priority Levels
- `Normal` - Regular priority
- `Urgent` - High priority
- `Emergency` - Critical priority

## 🔄 Data Flow Architecture

### 1. Frontend Request
```javascript
// PharmacyOrders.js
const fetchOrders = async () => {
  const url = new URL("http://localhost:5000/api/roms/pharmacy-tasks")
  if (pharmFilter && pharmFilter !== 'All') {
    url.searchParams.append('pharmacy_id', pharmFilter)
  }
  const res = await fetch(url.toString())
  const data = await res.json()
  // Transform data for UI
}
```

### 2. Backend Processing
```javascript
// romsController.js
const getPharmacyRequests = async (req, res, next) => {
  let pharmacy_id = req.query?.pharmacy_id
  
  const filter = {}
  if (pharmacy_id && pharmacy_id !== 'ALL') {
    // Direct pharmacy name filtering
    filter.pharmacy_id = pharmacy_id
  }
  
  const requests = await MedicationRequest.find(filter).sort({ createdAt: -1 })
  res.json(requests)
}
```

### 3. Database Query
```sql
-- Equivalent MongoDB query
db.medicationrequests.find({ 
  "pharmacy_id": "Gampaha Pharmacy" 
}).sort({ "createdAt": -1 })
```

### 4. Data Transformation
```javascript
// Frontend transformation
const transformedOrders = data.map(order => ({
  id: order._id || `ORD-${order.patient_id}`,
  pharmacy: order.pharmacy_id || 'Unknown Pharmacy',
  medicine: order.notes || 'Medicine Request',
  status: mapStatus(order.status),           // Pending → pending
  priority: mapPriority(order.priority_level), // Urgent → urgent
  orderedAt: order.createdAt || order.request_date,
  patient_id: order.patient_id,
  notes: order.notes || ''
}))
```

## 📱 User Interface Integration

### InventoryDashboard → PharmacyOrders
```
User clicks "Orders" button
    ↓
Navigate to: /orders?pharmacy=Gampaha%20Pharmacy
    ↓
PharmacyOrders reads URL parameter
    ↓
API call: GET /api/roms/pharmacy-tasks?pharmacy_id=Gampaha Pharmacy
    ↓
Database: MedicationRequest.find({ pharmacy_id: "Gampaha Pharmacy" })
    ↓
Display: 2 orders for Gampaha Pharmacy
```

### Pharmacy Filtering Results
```
Gampaha Pharmacy: 2 orders
  • PAT-002 - Approved - Urgent (Paracetamol 500mg)
  • PAT-001 - Pending - Normal (Amoxicillin 500mg)

Test Pharmacy 2: 2 orders  
  • PAT-003 - Ready - Normal (Ibuprofen 400mg)
  • PAT-004 - Pending - Emergency (Salbutamol Inhaler)

Uduwella: 1 order
  • PAT-005 - Rejected - Normal (Vitamin D3)

MediReach: 2 orders
  • PAT-006 - Pending - Urgent (Metformin 850mg)
  • PAT-007 - Approved - Normal (Amlodipine 5mg)
```

## 🛠️ Technical Implementation

### API Endpoint
- **URL**: `GET /api/roms/pharmacy-tasks`
- **Parameter**: `?pharmacy_id={pharmacyName}`
- **Response**: Array of MedicationRequest documents
- **Sorting**: By `createdAt` descending (newest first)

### Status Mapping
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

### Priority Mapping
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

## 🧪 Testing & Verification

### Database Tests
```javascript
// Direct database queries
await MedicationRequest.find({ pharmacy_id: "Gampaha Pharmacy" })
await MedicationRequest.find({ status: "Pending" })
await MedicationRequest.find({ priority_level: "Urgent" })
```

### API Tests
```javascript
// API endpoint tests
GET /api/roms/pharmacy-tasks                    // All orders (7)
GET /api/roms/pharmacy-tasks?pharmacy_id=MediReach  // MediReach orders (2)
GET /api/roms/pharmacy-tasks?pharmacy_id=Gampaha%20Pharmacy // Gampaha orders (2)
```

### Frontend Integration
- ✅ Loading states during data fetch
- ✅ Error handling with retry functionality
- ✅ Real-time data display
- ✅ Pharmacy-specific filtering
- ✅ Order status and priority visualization
- ✅ Order actions (dispatch/reject)

## 📊 Current Data Status

### Sample Data Added
```
Total Orders: 7
Gampaha Pharmacy: 2 orders
Test Pharmacy 2: 2 orders  
Uduwella: 1 order
MediReach: 2 orders
```

### Order Status Distribution
```
Pending: 3 orders
Approved: 2 orders
Ready: 1 order
Rejected: 1 order
```

### Priority Distribution
```
Normal: 4 orders
Urgent: 2 orders
Emergency: 1 order
```

## 🎯 Benefits Achieved

1. **Real Database Integration**: Uses actual MedicationRequest table
2. **Pharmacy Filtering**: Filters by pharmacy_id field accurately
3. **Live Data**: Real-time order status and updates
4. **Scalable Architecture**: Handles multiple pharmacies efficiently
5. **Professional UI**: Modern, responsive order management
6. **Data Integrity**: Proper field mapping and transformation
7. **Error Resilience**: Graceful handling of API failures
8. **User Efficiency**: Streamlined workflow for pharmacy staff

## 🚀 Complete Workflow

1. **Order Placement** → MedicationRequest created in database
2. **Pharmacy Dashboard** → Shows order counts per pharmacy
3. **Orders Button** → Navigates to filtered orders view
4. **Database Query** → MedicationRequest.find({ pharmacy_id })
5. **Data Display** → Transformed and shown in PharmacyOrders
6. **Order Management** → Dispatch/reject with status updates

The PharmacyOrders page now successfully integrates with the MedicationRequest table, providing a complete, real-time order management system filtered by pharmacy_id!
