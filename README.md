# MediReach

MediReach is a comprehensive healthcare platform connecting patients with pharmacies. It streamlines medication requests, pharmacy management, and inventory tracking.

## i. Setup Instructions

Follow these steps to get the project running in your local environment.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)
- Git

### 1. Clone the Repository
```bash
git clone <repository_url>
cd MediReach
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment Configuration:
   Create a `.env` file in the `backend` directory based on the following template:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/medireach
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
   *(Ensure you update the variables with your actual credentials)*
4. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000` by default.

---
Classification: Public-SLIIT
---

## ii. API Endpoint Documentation

### Authentication Requirements
Many endpoints are protected and require a standard JWT token. 
Pass the token in the `Authorization` header of your HTTP request:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Authentication (`/api/auth`)
*No token required.*

- **`POST /api/auth/register`** 
  - **Description**: Register a new user.
  - **Body**: `{ "name": "John", "email": "john@ex.com", "password": "pass" }`
- **`POST /api/auth/login`**
  - **Description**: Authenticate a user and return a JWT.
  - **Body**: `{ "email": "john@ex.com", "password": "pass" }`
- **`POST /api/auth/forgot-password`**
  - **Description**: Send OTP to user's email for password recovery.
- **`POST /api/auth/verify-otp`**
  - **Description**: Verify the OTP sent to the email.
- **`POST /api/auth/reset-password`**
  - **Description**: Reset password after OTP verification.

### 2. Users (`/api/users`)
*Requires Authentication.*

- **`GET /api/users/profile`** - Get logged-in user's profile.
- **`PUT /api/users/profile`** - Update logged-in user's profile.
- **`DELETE /api/users/profile`** - Delete logged-in user's account.
- **`GET /api/users/pharmacies`** - Get a list of all users with the 'pharmacy' role.
- **`GET /api/users/`** *(Admin Only)* - Get all users.
- **`GET /api/users/:id`** *(Admin Only)* - Get a user by ID.
- **`DELETE /api/users/:id`** *(Admin Only)* - Delete a specific user.

### 3. Pharmacies (`/api/pharmacies`)

- **`GET /api/pharmacies/`** - Get all pharmacies with optional pagination & filters.
- **`GET /api/pharmacies/search`** - Search for pharmacies via query parameters.
- **`GET /api/pharmacies/nearby`** - Get pharmacies near a specific location.
- **`GET /api/pharmacies/open-now`** - Get currently open pharmacies.
- **`GET /api/pharmacies/24-7`** - Get 24/7 operating pharmacies.
- **`GET /api/pharmacies/stats`** - Get overall system pharmacy statistics.
- **`GET /api/pharmacies/:id`** - Get a single pharmacy by ID.
- **`POST /api/pharmacies/`** - Create a new pharmacy record.
- **`PUT /api/pharmacies/:id`** - Replace an entire pharmacy resource.
- **`PATCH /api/pharmacies/:id`** - Partially update a pharmacy record.

### 4. Medication Requests/ROMS (`/api/roms`)
*Requires Authentication.*

- **`POST /api/roms/request`** 
  - **Description**: Patient drops an order (FormData: text + `prescription_image`).
- **`GET /api/roms/request`** - Get all drug requests for a user.
- **`GET /api/roms/request/:id`** - Get specific request by ID.
- **`PUT /api/roms/request/:id`** - Update a request (e.g., replace prescription image).
- **`DELETE /api/roms/request/:id`** - Delete a request.
- **`POST /api/roms/:id/cancel`** - Cancel a pending request.
- **`GET /api/roms/pharmacy-tasks`** - Get requests routed to the logged-in pharmacy.
- **`PUT /api/roms/:id/process`** - Pharmacy action to process (accept/reject) a routed request.

### 5. Medicines/Inventory (`/medicines`)

- **`GET /medicines/`** - Fetch all medicines.
- **`POST /medicines/`** - Add a new medicine.
- **`GET /medicines/:id`** - Retrieve specific medicine details.
- **`PUT /medicines/:id`** - Update medicine details.
- **`PUT /medicines/stock/update`** - Update stock count.
- **`DELETE /medicines/:id`** - Delete a medicine.

### 6. Reports (`/api/reports`)
*(Generates and exports data. Query params format: json or pdf)*

- **`GET /api/reports/inventory`** - Generate an inventory summary report.
- **`GET /api/reports/expiry`** - Check upcoming expiring medicines.
- **`GET /api/reports/low-stock`** - View low-stock warning items.
- **`GET /api/reports/pharmacy`** - Generate active pharmacy performance report.
- **`GET /api/reports/orders`** - See medication orders aggregate report.

### 7. Dashboard (`/api/dashboard`)

- **`GET /api/dashboard/stats`** - General system statistics (medicines, low stock, etc).
- **`GET /api/dashboard/medicines`** - Fetches recent medicines for dashboard preview.

### 8. Inquiries (`/api/inquiries`)

- **`POST /api/inquiries/`** - Create a new contact inquiry (Public).
- **`GET /api/inquiries/by-email/:email`** - Fetch inquiries mapped to a respective email.
- **`GET /api/inquiries/`** *(Admin)* - Fetch all system inquiries.
- **`PATCH /api/inquiries/:id`** *(Admin)* - Update inquiry response status/priority.

### Example Request/Response: Medication Request
**Request**
```http
POST /api/roms/request
Authorization: Bearer eyJhbGci...
Content-Type: multipart/form-data
```
**Form-Data Configuration**:
- `prescription_image`: (File)
- `delivery_address`: "No 12, Galle Road, Colombo"
- `priority`: "Normal"

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Medication request successfully routed to local pharmacies.",
  "data": {
    "requestId": "64d0bc7b80a...",
    "status": "Pending",
    "createdAt": "2023-11-20T10:00:00.000Z"
  }
}
```