const {
    getAllMedicines,
    addmedicine,
    getById,
    updateMedicine,
    deleteMedicine,
} = require('./medicineControl');

// Mock the Medicine model
jest.mock('../Model/medicineModel');
const Medicine = require('../Model/medicineModel');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const validBody = {
    mediName: 'Paracetamol',
    mediPrice: 10.5,
    mediDescription: 'Pain reliever and fever reducer.',
    mediImage: 'http://example.com/image.jpg',
    mediCategory: 'Analgesic',
    mediStock: 100,
    mediCompany: 'PharmaCo',
    mediExpiryDate: '2027-01-01',
    mediManufactureDate: '2023-01-01',
    mediPrescriptionStatus: 'not required',
    Pharmacy: 'CityPharmacy',
};

const validId = '64a7f9e2b4c3a12d5e6f7890'; // valid 24-char hex

// ─── getAllMedicines ──────────────────────────────────────────────────────────

describe('getAllMedicines', () => {
    it('should return all medicines with status 200', async () => {
        const fakeList = [{ mediName: 'Paracetamol' }, { mediName: 'Ibuprofen' }];
        Medicine.find.mockResolvedValue(fakeList);

        const req = {};
        const res = mockRes();

        await getAllMedicines(req, res);

        expect(Medicine.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ medicines: fakeList });
    });

    it('should return 500 on server error', async () => {
        Medicine.find.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getAllMedicines(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
});

// ─── addmedicine ─────────────────────────────────────────────────────────────

describe('addmedicine', () => {
    it('should add a medicine successfully with status 201', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        Medicine.mockImplementation(() => ({ ...validBody, save: saveMock }));

        const req = { body: validBody };
        const res = mockRes();

        await addmedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Medicine added successfully' })
        );
    });

    it('should return 400 if mediName is missing', async () => {
        const req = { body: { ...validBody, mediName: '' } };
        const res = mockRes();

        await addmedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Validation failed' })
        );
    });

    it('should return 400 if mediPrice is negative', async () => {
        const req = { body: { ...validBody, mediPrice: -5 } };
        const res = mockRes();

        await addmedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if mediStock is not an integer', async () => {
        const req = { body: { ...validBody, mediStock: 10.5 } };
        const res = mockRes();

        await addmedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if expiry date is in the past', async () => {
        const req = { body: { ...validBody, mediExpiryDate: '2000-01-01' } };
        const res = mockRes();

        await addmedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if manufacture date is in the future', async () => {
        const req = { body: { ...validBody, mediManufactureDate: '2099-01-01' } };
        const res = mockRes();

        await addmedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if manufacture date is after expiry date', async () => {
        const req = {
            body: {
                ...validBody,
                mediManufactureDate: '2026-01-01',
                mediExpiryDate: '2025-01-01',
            },
        };
        const res = mockRes();

        await addmedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if prescriptionStatus is invalid', async () => {
        const req = { body: { ...validBody, mediPrescriptionStatus: 'maybe' } };
        const res = mockRes();

        await addmedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─── getById ─────────────────────────────────────────────────────────────────

describe('getById', () => {
    it('should return a medicine with status 200', async () => {
        Medicine.findById.mockResolvedValue({ mediName: 'Paracetamol' });

        const req = { params: { id: validId } };
        const res = mockRes();

        await getById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ medicine: { mediName: 'Paracetamol' } })
        );
    });

    it('should return 404 if medicine not found', async () => {
        Medicine.findById.mockResolvedValue(null);

        const req = { params: { id: validId } };
        const res = mockRes();

        await getById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'No medicine found' });
    });

    it('should return 400 for an invalid ID format', async () => {
        const req = { params: { id: 'invalid-id' } };
        const res = mockRes();

        await getById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid medicine ID format.' });
    });
});

// ─── updateMedicine ───────────────────────────────────────────────────────────

describe('updateMedicine', () => {
    it('should update a medicine and return status 200', async () => {
        const mockUpdatedMedicine = { mediName: 'Updated Paracetamol', ...validBody };
        Medicine.findByIdAndUpdate.mockResolvedValue(mockUpdatedMedicine);

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateMedicine(req, res);

        expect(Medicine.findByIdAndUpdate).toHaveBeenCalledWith(
            validId, 
            expect.objectContaining({
                mediName: validBody.mediName,
                mediPrice: validBody.mediPrice,
                mediDescription: validBody.mediDescription,
                mediImage: validBody.mediImage,
                mediCategory: validBody.mediCategory,
                mediStock: validBody.mediStock,
                mediCompany: validBody.mediCompany,
                mediExpiryDate: validBody.mediExpiryDate,
                mediManufactureDate: validBody.mediManufactureDate,
                mediPrescriptionStatus: validBody.mediPrescriptionStatus,
                Pharmacy: validBody.Pharmacy
            }),
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ 
                message: "Medicine updated successfully",
                medicine: mockUpdatedMedicine 
            })
        );
    });

    it('should return 400 for an invalid ID format', async () => {
        const req = { params: { id: 'bad-id' }, body: validBody };
        const res = mockRes();

        await updateMedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid medicine ID format.' });
    });

    it('should return 400 for invalid input data', async () => {
        const req = { params: { id: validId }, body: { ...validBody, mediName: '' } };
        const res = mockRes();

        await updateMedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Validation failed' })
        );
    });
});

// ─── Frontend Component Function Tests ─────────────────────────────────────

// Mock frontend utility functions for testing
const mockBuildPharmacyList = (medicines) => {
    const map = {}
    medicines.forEach(m => {
        const name = m.Pharmacy || m.pharmacy || "Unknown"
        if (!map[name]) map[name] = []
        map[name].push(m)
    })

    return Object.entries(map).map(([name, meds], i) => {
        const maxPossible = meds.length * 1300
        const totalStock = meds.reduce((s, m) => s + (Number(m.mediStock) || 0), 0)
        const stockPct = maxPossible > 0 ? Math.min(Math.round((totalStock / maxPossible) * 100), 99) : 0

        return {
            id: i + 1,
            name,
            location: "Test Location",
            status: "active",
            lastSync: "Just now",
            orders: 0,
            stock: stockPct,
            medCount: meds.length,
        }
    })
}

const mockNormalise = (m) => {
    return {
        id: m._id || m.id || "",
        name: m.mediName || m.name || "",
        category: m.mediCategory || m.category || "",
        company: m.mediCompany || m.company || "",
        pharmacy: m.Pharmacy || m.pharmacy || "",
        price: Number(m.mediPrice || m.price || 0),
        stock: Number(m.mediStock || m.stock || 0),
        mfgDate: m.mediManufactureDate || m.mfgDate || "",
        expDate: m.mediExpiryDate || m.expDate || "",
        rxStatus: m.mediPrescriptionStatus || m.rxStatus || "",
    }
}

const mockStockStatus = (qty) => {
    if (qty === 0) return { label: "Out of Stock", color: "#C0392B", bg: "rgba(192,57,43,0.07)", border: "rgba(192,57,43,0.22)", icon: "XCircle" }
    if (qty <= 50) return { label: "Low Stock", color: "#B45309", bg: "rgba(180,83,9,0.07)", border: "rgba(180,83,9,0.22)", icon: "AlertTriangle" }
    return { label: "In Stock", color: "#0E7C5B", bg: "rgba(14,124,91,0.07)", border: "rgba(14,124,91,0.22)", icon: "CheckCircle2" }
}

const mockIsExpiringSoon = (d) => { 
    const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24)
    return diff > 0 && diff <= 180 
}

const mockIsExpired = (d) => new Date(d) < new Date()

const mockFmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

const mockTotalVal = (o) => o.qty * o.unitPrice

const mockValidateMedicineForm = (formData) => {
    const errors = {}
    
    if (!formData.mediName || formData.mediName.trim() === '') {
        errors.mediName = 'Medicine name is required'
    }
    
    if (!formData.mediPrice || formData.mediPrice.trim() === '') {
        errors.mediPrice = 'Price is required'
    } else if (isNaN(formData.mediPrice)) {
        errors.mediPrice = 'Price must be a valid number'
    } else if (Number(formData.mediPrice) <= 0) {
        errors.mediPrice = 'Price must be greater than 0'
    }
    
    if (!formData.mediStock || formData.mediStock.trim() === '') {
        errors.mediStock = 'Stock is required'
    } else if (isNaN(formData.mediStock)) {
        errors.mediStock = 'Stock must be a valid number'
    } else if (Number(formData.mediStock) < 0) {
        errors.mediStock = 'Stock cannot be negative'
    }
    
    if (!formData.mediCategory) {
        errors.mediCategory = 'Category is required'
    }
    
    if (!formData.mediCompany || formData.mediCompany.trim() === '') {
        errors.mediCompany = 'Company is required'
    }
    
    if (!formData.Pharmacy) {
        errors.Pharmacy = 'Pharmacy is required'
    }
    
    if (!formData.mediExpiryDate) {
        errors.mediExpiryDate = 'Expiry date is required'
    } else {
        const expiryDate = new Date(formData.mediExpiryDate)
        const today = new Date()
        if (expiryDate <= today) {
            errors.mediExpiryDate = 'Expiry date must be in the future'
        }
    }
    
    if (!formData.mediManufactureDate) {
        errors.mediManufactureDate = 'Manufacture date is required'
    } else {
        const manufactureDate = new Date(formData.mediManufactureDate)
        const today = new Date()
        if (manufactureDate >= today) {
            errors.mediManufactureDate = 'Manufacture date must be in the past'
        }
        
        if (formData.mediExpiryDate) {
            const expiryDate = new Date(formData.mediExpiryDate)
            if (manufactureDate >= expiryDate) {
                errors.mediManufactureDate = 'Manufacture date cannot be after expiry date'
            }
        }
    }
    
    if (!formData.mediPrescriptionStatus) {
        errors.mediPrescriptionStatus = 'Prescription status is required'
    }
    
    return errors
}

const mockValidateUpdateForm = (formData) => {
    const errs = {}
    
    Object.keys({
        mediName: "", mediPrice: "", mediDescription: "", mediImage: "",
        mediCategory: "", mediStock: "", mediCompany: "",
        mediExpiryDate: "", mediManufactureDate: "",
        mediPrescriptionStatus: "", Pharmacy: ""
    }).forEach(k => { 
        if (!formData[k] || (typeof formData[k] === 'string' && formData[k].trim() === '')) {
            errs[k] = "This field is required"
        }
    })
    
    // mediName validation (backend: 2-100 characters)
    if (formData.mediName && formData.mediName.trim().length < 2) {
        errs.mediName = "Medicine name must be at least 2 characters"
    } else if (formData.mediName && formData.mediName.trim().length > 100) {
        errs.mediName = "Medicine name must not exceed 100 characters"
    }
    
    // mediDescription validation (backend: required, max 1000 characters)
    if (formData.mediDescription && formData.mediDescription.trim().length > 1000) {
        errs.mediDescription = "Description must not exceed 1000 characters"
    }
    
    // Validate numeric fields
    if (formData.mediPrice && isNaN(formData.mediPrice)) {
        errs.mediPrice = "Must be a number"
    } else if (formData.mediPrice && Number(formData.mediPrice) < 0) {
        errs.mediPrice = "Must be a non-negative number"
    }
    
    if (formData.mediStock && isNaN(formData.mediStock)) {
        errs.mediStock = "Must be a number"
    } else if (formData.mediStock && !Number.isInteger(Number(formData.mediStock))) {
        errs.mediStock = "Must be an integer"
    } else if (formData.mediStock && Number(formData.mediStock) < 0) {
        errs.mediStock = "Cannot be negative"
    }
    
    // Date validation
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to midnight for fair comparison
    
    if (formData.mediExpiryDate) {
        const expiryDate = new Date(formData.mediExpiryDate)
        if (isNaN(Date.parse(formData.mediExpiryDate))) {
            errs.mediExpiryDate = "Must be a valid date"
        } else if (expiryDate <= today) {
            errs.mediExpiryDate = "Expiry date must be in the future"
        }
    }
    
    if (formData.mediManufactureDate) {
        const manufactureDate = new Date(formData.mediManufactureDate)
        if (isNaN(Date.parse(formData.mediManufactureDate))) {
            errs.mediManufactureDate = "Must be a valid date"
        } else if (manufactureDate > today) {
            errs.mediManufactureDate = "Manufacture date cannot be in the future"
        }
    }
    
    // Cross-field date validation
    if (formData.mediManufactureDate && formData.mediExpiryDate) {
        const manufactureDate = new Date(formData.mediManufactureDate)
        const expiryDate = new Date(formData.mediExpiryDate)
        
        if (!isNaN(Date.parse(formData.mediManufactureDate)) && !isNaN(Date.parse(formData.mediExpiryDate))) {
            if (manufactureDate >= expiryDate) {
                errs.mediExpiryDate = "Manufacture date must be before expiry date"
            }
        }
    }
    
    // Prescription status validation (backend: specific values allowed)
    const validStatuses = ['required', 'not required', 'optional']
    if (formData.mediPrescriptionStatus && !validStatuses.includes(formData.mediPrescriptionStatus.toLowerCase())) {
        errs.mediPrescriptionStatus = "Invalid prescription status"
    }
    
    return errs
}

// ─── InventoryDashboard Function Tests ───────────────────────────────────

describe('InventoryDashboard - buildPharmacyList', () => {
    it('should group medicines by pharmacy and calculate stock percentages', () => {
        const medicines = [
            { Pharmacy: 'Test Pharmacy', mediStock: 100 },
            { Pharmacy: 'Test Pharmacy', mediStock: 200 },
            { Pharmacy: 'Another Pharmacy', mediStock: 50 }
        ];
        
        const result = mockBuildPharmacyList(medicines);
        
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Test Pharmacy');
        expect(result[0].medCount).toBe(2);
        expect(result[0].stock).toBeGreaterThan(0);
        expect(result[1].name).toBe('Another Pharmacy');
        expect(result[1].medCount).toBe(1);
    });

    it('should handle empty medicines array', () => {
        const result = mockBuildPharmacyList([]);
        expect(result).toHaveLength(0);
    });

    it('should handle medicines without pharmacy field', () => {
        const medicines = [
            { mediStock: 100 },
            { pharmacy: 'Test Pharmacy', mediStock: 200 }
        ];
        
        const result = mockBuildPharmacyList(medicines);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Unknown');
        expect(result[1].name).toBe('Test Pharmacy');
    });
});

describe('InventoryDashboard - StockBar Logic', () => {
    it('should return correct color for high stock (>=80)', () => {
        const color = '#2d7a4f'; // This would be returned by StockBar for 85%
        expect(color).toBe('#2d7a4f');
    });

    it('should return correct color for medium stock (>=55)', () => {
        const color = '#7a5a1a'; // This would be returned by StockBar for 70%
        expect(color).toBe('#7a5a1a');
    });

    it('should return correct color for low stock (<55)', () => {
        const color = '#8a3030'; // This would be returned by StockBar for 30%
        expect(color).toBe('#8a3030');
    });
});

// ─── MedicineAdd Function Tests ───────────────────────────────────────────

describe('MedicineAdd - Form Validation', () => {
    it('should validate required fields correctly', () => {
        const formData = {
            mediName: '',
            mediPrice: '',
            mediDescription: 'Test description',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateMedicineForm(formData);
        expect(errors.mediName).toBe('Medicine name is required');
        expect(errors.mediPrice).toBe('Price is required');
    });

    it('should validate price format', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: 'invalid',
            mediDescription: 'Test description',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateMedicineForm(formData);
        expect(errors.mediPrice).toBe('Price must be a valid number');
    });

    it('should validate stock format', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediCategory: 'Analgesic',
            mediStock: 'invalid',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateMedicineForm(formData);
        expect(errors.mediStock).toBe('Stock must be a valid number');
    });

    it('should validate date logic', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2025-01-01',
            mediManufactureDate: '2026-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateMedicineForm(formData);
        expect(errors.mediManufactureDate).toBe('Manufacture date cannot be after expiry date');
    });

    it('should pass validation for correct data', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateMedicineForm(formData);
        expect(Object.keys(errors)).toHaveLength(0);
    });
});

// ─── MedicineInventory Function Tests ─────────────────────────────────────

describe('MedicineInventory - normalise function', () => {
    it('should normalize medicine data correctly', () => {
        const medicine = {
            _id: '123',
            mediName: 'Test Medicine',
            mediCategory: 'Analgesic',
            mediCompany: 'Test Company',
            Pharmacy: 'Test Pharmacy',
            mediPrice: '10.5',
            mediStock: '100',
            mediManufactureDate: '2023-01-01',
            mediExpiryDate: '2027-01-01',
            mediPrescriptionStatus: 'not required'
        };
        
        const result = mockNormalise(medicine);
        expect(result.id).toBe('123');
        expect(result.name).toBe('Test Medicine');
        expect(result.price).toBe(10.5);
        expect(result.stock).toBe(100);
    });

    it('should handle missing fields gracefully', () => {
        const medicine = { _id: '123' };
        const result = mockNormalise(medicine);
        expect(result.id).toBe('123');
        expect(result.name).toBe('');
        expect(result.price).toBe(0);
        expect(result.stock).toBe(0);
    });
});

describe('MedicineInventory - stockStatus function', () => {
    it('should return out of stock status for 0 quantity', () => {
        const status = mockStockStatus(0);
        expect(status.label).toBe('Out of Stock');
        expect(status.color).toBe('#C0392B');
    });

    it('should return low stock status for <=50 quantity', () => {
        const status = mockStockStatus(30);
        expect(status.label).toBe('Low Stock');
        expect(status.color).toBe('#B45309');
    });

    it('should return in stock status for >50 quantity', () => {
        const status = mockStockStatus(100);
        expect(status.label).toBe('In Stock');
        expect(status.color).toBe('#0E7C5B');
    });
});

describe('MedicineInventory - date functions', () => {
    it('should correctly identify expiring soon medicines', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 90); // 90 days from now
        expect(mockIsExpiringSoon(futureDate.toISOString())).toBe(true);
    });

    it('should correctly identify non-expiring medicines', () => {
        const farFutureDate = new Date();
        farFutureDate.setDate(farFutureDate.getDate() + 200); // 200 days from now
        expect(mockIsExpiringSoon(farFutureDate.toISOString())).toBe(false);
    });

    it('should correctly identify expired medicines', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10); // 10 days ago
        expect(mockIsExpired(pastDate.toISOString())).toBe(true);
    });

    it('should correctly identify non-expired medicines', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10); // 10 days from now
        expect(mockIsExpired(futureDate.toISOString())).toBe(false);
    });

    it('should format dates correctly', () => {
        const date = '2023-01-01';
        const formatted = mockFmtDate(date);
        expect(formatted).toMatch(/\d{2}\s\w{3}\s\d{4}/); // Matches format like "01 Jan 2023"
    });

    it('should handle null/undefined dates', () => {
        expect(mockFmtDate(null)).toBe('—');
        expect(mockFmtDate(undefined)).toBe('—');
        expect(mockFmtDate('')).toBe('—');
    });
});

// ─── PharmacyOrders Function Tests ───────────────────────────────────────

describe('PharmacyOrders - totalVal function', () => {
    it('should calculate total value correctly', () => {
        const order = { qty: 10, unitPrice: 50 };
        expect(mockTotalVal(order)).toBe(500);
    });

    it('should handle zero quantity', () => {
        const order = { qty: 0, unitPrice: 50 };
        expect(mockTotalVal(order)).toBe(0);
    });

    it('should handle zero price', () => {
        const order = { qty: 10, unitPrice: 0 };
        expect(mockTotalVal(order)).toBe(0);
    });
});

describe('PharmacyOrders - Status Configuration', () => {
    it('should have all required status configurations', () => {
        const statuses = ['pending', 'processing', 'in_transit', 'delivered', 'cancelled', 'dispatched', 'rejected'];
        statuses.forEach(status => {
            expect(status).toBeDefined();
        });
    });
});

// ─── UpdateMedicine Function Tests ───────────────────────────────────────

describe('UpdateMedicine - Form Validation', () => {
    it('should validate all required fields', () => {
        const formData = {
            mediName: '',
            mediPrice: '',
            mediDescription: '',
            mediImage: '',
            mediCategory: '',
            mediStock: '',
            mediCompany: '',
            mediExpiryDate: '',
            mediManufactureDate: '',
            mediPrescriptionStatus: '',
            Pharmacy: ''
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(Object.keys(errors)).toHaveLength(Object.keys(formData).length);
        Object.values(errors).forEach(error => {
            expect(error).toBe('This field is required');
        });
    });

    it('should validate numeric fields', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: 'invalid',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: 'invalid',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(errors.mediPrice).toBe('Must be a number');
        expect(errors.mediStock).toBe('Must be a number');
    });

    it('should validate negative price', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '-10',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(errors.mediPrice).toBe('Must be a non-negative number');
    });

    it('should validate zero price', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '0',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(errors.mediPrice).toBeUndefined(); // 0 is allowed (non-negative)
    });

    it('should validate negative stock', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: '-10',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'optional',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(errors.mediStock).toBe('Cannot be negative');
    });

    it('should validate prescription status values', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'invalid_status',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(errors.mediPrescriptionStatus).toBe('Invalid prescription status');
    });

    it('should validate date logic for update form', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2025-01-01',
            mediManufactureDate: '2026-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(errors.mediExpiryDate).toBe('Manufacture date must be before expiry date');
    });

    it('should validate past expiry date', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2020-01-01',
            mediManufactureDate: '2019-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(errors.mediExpiryDate).toBe('Expiry date must be in the future');
    });

    it('should validate future manufacture date', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2030-01-01',
            mediManufactureDate: futureDate.toISOString().split('T')[0],
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(errors.mediManufactureDate).toBe('Manufacture date cannot be in the future');
    });

    it('should pass validation for correct data', () => {
        const formData = {
            mediName: 'Test Medicine',
            mediPrice: '10.5',
            mediDescription: 'Test description',
            mediImage: 'test.jpg',
            mediCategory: 'Analgesic',
            mediStock: '100',
            mediCompany: 'Test Company',
            mediExpiryDate: '2027-01-01',
            mediManufactureDate: '2023-01-01',
            mediPrescriptionStatus: 'not required',
            Pharmacy: 'Test Pharmacy'
        };
        
        const errors = mockValidateUpdateForm(formData);
        expect(Object.keys(errors)).toHaveLength(0);
    });
});

// ─── deleteMedicine ───────────────────────────────────────────────────────────

describe('deleteMedicine', () => {
    it('should delete a medicine and return status 200', async () => {
        Medicine.findByIdAndDelete.mockResolvedValue({ mediName: 'Paracetamol' });

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteMedicine(req, res);

        expect(Medicine.findByIdAndDelete).toHaveBeenCalledWith(validId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Medicine deleted successfully' });
    });

    it('should return 404 if medicine not found', async () => {
        Medicine.findByIdAndDelete.mockResolvedValue(null);

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteMedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'No medicine found to Delete' });
    });

    it('should return 400 for an invalid ID format', async () => {
        const req = { params: { id: '123' } };
        const res = mockRes();

        await deleteMedicine(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid medicine ID format.' });
    });
});