import axios from 'axios';

// Create base axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 60000,
});

// Create axios instance for non-api routes
const apiNonAuth = axios.create({       
    baseURL: 'http://localhost:5000/api',
    timeout: 60000,
});

const apiNonAuthmedicine = axios.create({       
    baseURL: 'http://localhost:5000',
    timeout: 60000,
});
 
// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add request interceptor for non-auth routes
apiNonAuth.interceptors.request.use(
    (config) => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== AUTHENTICATION APIS ====================
export const authAPI = {
    // Login user
    login: (credentials) => apiNonAuth.post('/auth/login', credentials),
    
    // Register user
    register: (userData) => apiNonAuth.post('/auth/register', userData),
    
    // Forgot password
    forgotPassword: (email) => apiNonAuth.post('/auth/forgot-password', { email }),
    
    // Verify OTP
    verifyOTP: (email, otp) => apiNonAuth.post('/auth/verify-otp', { email, otp }),
    
    // Reset password
    resetPassword: (email, otp, password) => apiNonAuth.post('/auth/reset-password', { email, otp, password }),
};

// ==================== USER APIS ====================
export const userAPI = {
    // Get all users
    getAllUsers: () => api.get('/users'),
    
    // Get user by ID
    getUserById: (userId) => api.get(`/users/${userId}`),
    
    // Update user
    updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
    
    // Delete user
    deleteUser: (userId) => api.delete(`/users/${userId}`),
    
    // Update user profile
    updateProfile: (userData) => api.put('/users/profile', userData),
    
    // Get users with role 'pharmacy'
    getPharmacyUsers: () => api.get('/users/pharmacies'),
};

// ==================== PHARMACY APIS ====================
export const pharmacyAPI = {
    // Get all pharmacies
    getAllPharmacies: () => api.get('/pharmacies'),
    
    // Get pharmacy by ID
    getPharmacyById: (pharmacyId) => api.get(`/pharmacies/${pharmacyId}`),
    
    // Create pharmacy
    createPharmacy: (pharmacyData) => api.post('/pharmacies', pharmacyData),
    
    // Update pharmacy
    updatePharmacy: (pharmacyId, pharmacyData) => api.put(`/pharmacies/${pharmacyId}`, pharmacyData),
    
    // Delete pharmacy
    deletePharmacy: (pharmacyId) => api.delete(`/pharmacies/${pharmacyId}`),
    
    // Get pharmacy stats
    getPharmacyStats: () => api.get('/pharmacies/stats'),
    
    // Get active pharmacies
    getActivePharmacies: () => api.get('/pharmacies?isActive=true'),
    
    // Toggle pharmacy status
    toggleStatus: (pharmacyId) => api.patch(`/pharmacies/${pharmacyId}/toggle-status`),
    
    // Generate QR code
    generateQRCode: (pharmacyId) => api.get(`/pharmacies/${pharmacyId}/qrcode`),
    
    // Bulk delete pharmacies
    bulkDelete: (pharmacyIds) => api.post('/pharmacies/bulk-delete', { ids: pharmacyIds }),
};

// ==================== MEDICINE APIS ====================
export const medicineAPI = {
    // Get all medicines
    getAllMedicines: () => apiNonAuthmedicine.get('/medicines'),
    
    // Get medicine by ID
    getMedicineById: (medicineId) => apiNonAuthmedicine.get(`/medicines/${medicineId}`),
    
    // Create medicine
    createMedicine: (medicineData) => apiNonAuthmedicine.post('/medicines', medicineData),
    
    // Update medicine
    updateMedicine: (medicineId, medicineData) => apiNonAuthmedicine.put(`/medicines/${medicineId}`, medicineData),
    
    // Delete medicine
    deleteMedicine: (medicineId) => apiNonAuthmedicine.delete(`/medicines/${medicineId}`),
    
    // Update medicine stock
    updateStock: (stockData) => apiNonAuthmedicine.put('/medicines/stock/update', stockData),
    
    // Search medicines
    searchMedicines: (query) => apiNonAuthmedicine.get(`/medicines/search?q=${query}`),
};

// ==================== MEDICATION REQUEST (ROMS) APIS ====================
export const romsAPI = {
    // Get all requests
    getAllRequests: () => api.get('/roms/request'),
    
    // Get request by ID
    getRequestById: (requestId) => api.get(`/roms/request/${requestId}`),
    
    // Get requests by patient ID
    getRequestsByPatientId: (patientId) => api.get(`/roms/request?patient_id=${patientId}`),
    
    // Create new request
    createRequest: (requestData) => api.post('/roms/request', requestData),
    
    // Update request
    updateRequest: (requestId, requestData) => api.put(`/roms/request/${requestId}`, requestData),
    
    // Delete request
    deleteRequest: (requestId) => api.delete(`/roms/request/${requestId}`),
    
    // Get pharmacy tasks
    getPharmacyTasks: (pharmacyId) => api.get(`/roms/pharmacy-tasks${pharmacyId ? `?pharmacy_id=${pharmacyId}` : ''}`),
    
    // Process request (accept/reject/dispatch)
    processRequest: (requestId, actionData) => api.put(`/roms/${requestId}/process`, actionData),
    
    // Cancel request
    cancelRequest: (requestId, reason) => api.put(`/roms/${requestId}/cancel`, { reason }),
    
    // Get routing status
    getRoutingStatus: (requestId) => api.get(`/roms/${requestId}/routing-status`),
    
    // Update payment status
    updatePaymentStatus: (requestId, paymentData) => api.put(`/roms/${requestId}/payment`, paymentData),
};

// ==================== MESSAGE APIS ====================
export const messageAPI = {
    // Get messages by chat ID
    getMessagesByChatId: (chatId) => apiNonAuth.get(`/messages/${chatId}`),
    
    // Send message
    sendMessage: (messageData) => apiNonAuth.post('/messages', messageData),
    
    // Get chats for user
    getUserChats: (userId) => api.get(`/messages/chats/${userId}`),
    
    // Start chat
    startChat: (chatData) => api.post('/chat/start', chatData),
};

// ==================== CHAT APIS ====================
export const chatAPI = {
    // Get all chats for current user
    getUserChats: () => api.get('/chat'),
    
    // Start a new chat
    startChat: (chatData) => api.post('/chat', chatData),
    
    // Get messages by chat ID
    getMessagesByChatId: (chatId) => api.get(`/chat/${chatId}/messages`),
    
    // Send message
    sendMessage: (chatId, messageData) => api.post(`/chat/${chatId}/messages`, messageData),
    
    // Mark chat as read
    markAsRead: (chatId) => api.put(`/chat/${chatId}/read`),
    
    // Delete chat
    deleteChat: (chatId) => api.delete(`/chat/${chatId}`),
};

// ==================== INQUIRY APIS ====================
export const inquiryAPI = {
    // Get all inquiries
    getAllInquiries: () => api.get('/inquiries'),
    
    // Get inquiry by ID
    getInquiryById: (inquiryId) => api.get(`/inquiries/${inquiryId}`),
    
    // Create inquiry
    createInquiry: (inquiryData) => api.post('/inquiries', inquiryData),
    
    // Update inquiry
    updateInquiry: (inquiryId, inquiryData) => api.put(`/inquiries/${inquiryId}`, inquiryData),
    
    // Delete inquiry
    deleteInquiry: (inquiryId) => api.delete(`/inquiries/${inquiryId}`),
    
    // Get inquiries by pharmacy
    getInquiriesByPharmacy: (pharmacyId) => api.get(`/inquiries/pharmacy/${pharmacyId}`),
    
    // Get inquiries by user
    getInquiriesByUser: (userEmail) => api.get(`/inquiries/by-email/${userEmail}`),
};

// ==================== REPORT APIS ====================
export const reportAPI = {
    // Generate sales report
    generateSalesReport: (params) => api.get('/reports/sales', { params }),
    
    // Generate inventory report
    generateInventoryReport: (params) => api.get('/reports/inventory', { params }),
    
    // Generate order report
    generateOrderReport: (params) => api.get('/reports/orders', { params }),
    
    // Generate pharmacy report
    generatePharmacyReport: (params) => api.get('/reports/pharmacies', { params }),
};

// ==================== DASHBOARD APIS ====================
export const dashboardAPI = {
    // Get admin dashboard stats
    getAdminStats: () => api.get('/dashboard/admin'),
    
    // Get pharmacy dashboard stats
    getPharmacyDashboardStats: (pharmacyId) => api.get(`/dashboard/pharmacy/${pharmacyId}`),
    
    // Get user dashboard stats
    getUserDashboardStats: (userId) => api.get(`/dashboard/user/${userId}`),
};

// ==================== UTILITY FUNCTIONS ====================
export const apiUtils = {
    // Handle API errors consistently
    handleError: (error) => {
        if (error.response) {
            // Server responded with error status
            return {
                message: error.response.data.message || 'Server error occurred',
                status: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            // Request was made but no response received
            return {
                message: 'Network error. Please check your connection.',
                status: null,
                data: null
            };
        } else {
            // Something else happened
            return {
                message: error.message || 'An unexpected error occurred',
                status: null,
                data: null
            };
        }
    },
    
    // Create FormData for file uploads
    createFormData: (data, fileField = 'file') => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === fileField && data[key] instanceof File) {
                formData.append(key, data[key]);
            } else if (Array.isArray(data[key])) {
                formData.append(key, JSON.stringify(data[key]));
            } else if (typeof data[key] === 'object' && data[key] !== null) {
                formData.append(key, JSON.stringify(data[key]));
            } else {
                formData.append(key, data[key]);
            }
        });
        return formData;
    },
    
    // Upload file with progress
    uploadFile: (file, endpoint, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return apiNonAuth.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        });
    },
    
    // Check if backend server is running
    checkServerStatus: async () => {
        try {
            const response = await apiNonAuth.get('/health');
            return { status: 'online', message: 'Server is running' };
        } catch (error) {
            if (error.response?.status === 404) {
                return { status: 'offline', message: 'Server is not running or endpoint not found' };
            }
            return { status: 'error', message: 'Server connection failed' };
        }
    },
    
    // Handle API errors consistently
    handleError: (error) => {
        if (error.response) {
            // Server responded with error status
            return {
                message: error.response.data.message || 'Server error occurred',
                status: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            // Request was made but no response received
            return {
                message: 'Network error. Please check your connection.',
                status: null,
                data: null
            };
        } else {
            // Something else happened
            return {
                message: error.message || 'An unexpected error occurred',
                status: null,
                data: null
            };
        }
    }
};

// Export the base API instances for backward compatibility
export default api;
export { apiNonAuth };
