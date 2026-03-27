// Mock the services and models at the very top
jest.mock('./backend/Services/romsService');
jest.mock('./backend/Model/MedicationRequest');

const {
    createRequest,
    getAllRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
    getPharmacyRequests,
    processRequest,
    cancelRequest
} = require('./backend/Controllers/romsController');

const romsService = require('./backend/Services/romsService');
const MedicationRequest = require('./backend/Model/MedicationRequest');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

const validBody = {
    pharmacy_id: 'pharm123',
    priority_level: 'Normal',
    expiry_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
    notes: 'Test notes'
};

const validId = '64a7f9e2b4c3a12d5e6f7890'; // valid 24-char hex

// ─── createRequest ────────────────────────────────────────────────────────────

describe('createRequest', () => {
    it('should create a request successfully with status 201', async () => {
        const fakeRequest = { ...validBody, _id: validId };
        romsService.createRequest.mockResolvedValue(fakeRequest);

        const req = { body: validBody, user: { _id: 'patient123' }, file: { path: 'path/to/image' } };
        const res = mockRes();

        await createRequest(req, res, mockNext);

        expect(romsService.createRequest).toHaveBeenCalledWith({ ...validBody, prescription_image: 'path/to/image' }, 'patient123');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(fakeRequest);
    });

    it('should create request without file', async () => {
        const fakeRequest = { ...validBody, _id: validId };
        romsService.createRequest.mockResolvedValue(fakeRequest);

        const req = { body: validBody, user: { _id: 'patient123' } };
        const res = mockRes();

        await createRequest(req, res, mockNext);

        expect(romsService.createRequest).toHaveBeenCalledWith(validBody, 'patient123');
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 on creation error', async () => {
        romsService.createRequest.mockRejectedValue(new Error('Creation error'));

        const req = { body: validBody, user: { _id: 'patient123' } };
        const res = mockRes();

        await createRequest(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalledWith(new Error('Creation error'));
    });
});

// ─── getAllRequests ───────────────────────────────────────────────────────────

describe('getAllRequests', () => {
    it('should return all requests for a patient', async () => {
        const fakeList = [{ ...validBody }];
        MedicationRequest.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeList)
        });

        const req = { user: { _id: 'patient123' } };
        const res = mockRes();

        await getAllRequests(req, res, mockNext);

        expect(MedicationRequest.find).toHaveBeenCalledWith({ patient_id: 'patient123' });
        expect(res.json).toHaveBeenCalledWith(fakeList);
    });

    it('should return all requests without filter', async () => {
        const fakeList = [{ ...validBody }];
        MedicationRequest.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeList)
        });

        const req = { query: {}, body: {} };
        const res = mockRes();

        await getAllRequests(req, res, mockNext);

        expect(MedicationRequest.find).toHaveBeenCalledWith({});
        expect(res.json).toHaveBeenCalledWith(fakeList);
    });

    it('should call next on error', async () => {
        MedicationRequest.find.mockReturnValue({
            sort: jest.fn().mockImplementation(() => Promise.reject(new Error('DB error')))
        });

        const req = {};
        const res = mockRes();

        await getAllRequests(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});

// ─── getRequestById ───────────────────────────────────────────────────────────

describe('getRequestById', () => {
    it('should return a request with status 200', async () => {
        const fakeRequest = { ...validBody };
        MedicationRequest.findById.mockResolvedValue(fakeRequest);

        const req = { params: { id: validId } };
        const res = mockRes();

        await getRequestById(req, res, mockNext);

        expect(MedicationRequest.findById).toHaveBeenCalledWith(validId);
        expect(res.json).toHaveBeenCalledWith(fakeRequest);
    });

    it('should return 404 if request not found', async () => {
        MedicationRequest.findById.mockResolvedValue(null);

        const req = { params: { id: validId } };
        const res = mockRes();

        await getRequestById(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Request not found'));
    });

    it('should call next on error', async () => {
        MedicationRequest.findById.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: validId } };
        const res = mockRes();

        await getRequestById(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});

// ─── updateRequest ────────────────────────────────────────────────────────────

describe('updateRequest', () => {
    it('should update a request and return status 200', async () => {
        const mockUpdatedRequest = { ...validBody };
        MedicationRequest.findByIdAndUpdate.mockResolvedValue(mockUpdatedRequest);

        const req = { params: { id: validId }, body: validBody, file: { path: 'path/to/image' } };
        const res = mockRes();

        await updateRequest(req, res, mockNext);

        expect(MedicationRequest.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            { ...validBody, prescription_image: 'path/to/image' },
            { new: true, runValidators: true }
        );
        expect(res.json).toHaveBeenCalledWith(mockUpdatedRequest);
    });

    it('should update request without file', async () => {
        const mockUpdatedRequest = { ...validBody };
        MedicationRequest.findByIdAndUpdate.mockResolvedValue(mockUpdatedRequest);

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateRequest(req, res, mockNext);

        expect(MedicationRequest.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            validBody,
            { new: true, runValidators: true }
        );
        expect(res.json).toHaveBeenCalledWith(mockUpdatedRequest);
    });

    it('should return 404 if request not found', async () => {
        MedicationRequest.findByIdAndUpdate.mockResolvedValue(null);

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateRequest(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Request not found'));
    });

    it('should return 400 on update error', async () => {
        MedicationRequest.findByIdAndUpdate.mockRejectedValue(new Error('Validation error'));

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateRequest(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalledWith(new Error('Validation error'));
    });
});

// ─── deleteRequest ────────────────────────────────────────────────────────────

describe('deleteRequest', () => {
    it('should delete a request and return status 200', async () => {
        const mockDeletedRequest = { ...validBody };
        MedicationRequest.findByIdAndDelete.mockResolvedValue(mockDeletedRequest);

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteRequest(req, res, mockNext);

        expect(MedicationRequest.findByIdAndDelete).toHaveBeenCalledWith(validId);
        expect(res.json).toHaveBeenCalledWith({ message: 'Request deleted successfully' });
    });

    it('should return 404 if request not found', async () => {
        MedicationRequest.findByIdAndDelete.mockResolvedValue(null);

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteRequest(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Request not found'));
    });

    it('should call next on error', async () => {
        MedicationRequest.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteRequest(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});

// ─── getPharmacyRequests ──────────────────────────────────────────────────────

describe('getPharmacyRequests', () => {
    it('should return pharmacy requests', async () => {
        const fakeList = [{ ...validBody }];
        MedicationRequest.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeList)
        });

        const req = { query: { pharmacy_id: 'pharm123' }, user: { _id: 'pharm123' } };
        const res = mockRes();

        await getPharmacyRequests(req, res, mockNext);

        expect(MedicationRequest.find).toHaveBeenCalledWith({ pharmacy_id: { $in: ['pharm123'] } });
        expect(res.json).toHaveBeenCalledWith(fakeList);
    });

    it('should handle ALL pharmacy_id', async () => {
        const fakeList = [{ ...validBody }];
        MedicationRequest.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeList)
        });

        const req = { query: { pharmacy_id: 'ALL' } };
        const res = mockRes();

        await getPharmacyRequests(req, res, mockNext);

        expect(MedicationRequest.find).toHaveBeenCalledWith({});
        expect(res.json).toHaveBeenCalledWith(fakeList);
    });

    it('should call next on error', async () => {
        MedicationRequest.find.mockReturnValue({
            sort: jest.fn().mockImplementation(() => Promise.reject(new Error('DB error')))
        });

        const req = { query: { pharmacy_id: 'pharm123' } };
        const res = mockRes();

        await getPharmacyRequests(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});

// ─── processRequest ───────────────────────────────────────────────────────────

describe('processRequest', () => {
    it('should process request successfully', async () => {
        const fakeRequest = { ...validBody };
        romsService.updateRequestAction.mockResolvedValue(fakeRequest);

        const req = { params: { id: validId }, body: { action: 'Approve', notes: 'Approved' }, user: { _id: 'pharm123' } };
        const res = mockRes();

        await processRequest(req, res, mockNext);

        expect(romsService.updateRequestAction).toHaveBeenCalledWith(validId, 'pharm123', 'Approve', 'Approved');
        expect(res.json).toHaveBeenCalledWith(fakeRequest);
    });

    it('should return 400 on process error', async () => {
        romsService.updateRequestAction.mockRejectedValue(new Error('Process error'));

        const req = { params: { id: validId }, body: { action: 'Approve' }, user: { _id: 'pharm123' } };
        const res = mockRes();

        await processRequest(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalledWith(new Error('Process error'));
    });
});

// ─── cancelRequest ────────────────────────────────────────────────────────────

describe('cancelRequest', () => {
    it('should cancel request successfully', async () => {
        const fakeRequest = { ...validBody };
        romsService.cancelRequest.mockResolvedValue(fakeRequest);

        const req = { params: { id: validId }, body: { reason: 'Changed mind' }, user: { _id: 'patient123' } };
        const res = mockRes();

        await cancelRequest(req, res, mockNext);

        expect(romsService.cancelRequest).toHaveBeenCalledWith(validId, 'patient123', 'Changed mind');
        expect(res.json).toHaveBeenCalledWith(fakeRequest);
    });

    it('should return 400 on cancel error', async () => {
        romsService.cancelRequest.mockImplementation(() => Promise.reject(new Error('Cancel error')));

        const req = { params: { id: validId }, body: { reason: 'Changed mind' }, user: { _id: 'patient123' } };
        const res = mockRes();

        await cancelRequest(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalledWith(new Error('Cancel error'));
    });
});