// Mock the RequestCancellation model at the very top
jest.mock('./backend/Model/RequestCancellation');

const {
    createCancellation,
    getAllCancellations,
    getCancellationById,
    updateCancellation,
    deleteCancellation,
} = require('./backend/Controllers/cancellationController');

const RequestCancellation = require('./backend/Model/RequestCancellation');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

const validBody = {
    request_id: 'req123',
    cancelled_by: 'user456',
    cancel_reason: 'Patient changed mind'
};

const validId = '64a7f9e2b4c3a12d5e6f7890'; // valid 24-char hex

// ─── createCancellation ───────────────────────────────────────────────────────

describe('createCancellation', () => {
    it('should create a cancellation successfully with status 201', async () => {
        const fakeCancellation = { ...validBody, _id: validId };
        RequestCancellation.create.mockResolvedValue(fakeCancellation);

        const req = { body: validBody };
        const res = mockRes();

        await createCancellation(req, res, mockNext);

        expect(RequestCancellation.create).toHaveBeenCalledWith(validBody);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(fakeCancellation);
    });

    it('should return 400 on creation error', async () => {
        RequestCancellation.create.mockRejectedValue(new Error('Validation error'));

        const req = { body: validBody };
        const res = mockRes();

        await createCancellation(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalledWith(new Error('Validation error'));
    });
});

// ─── getAllCancellations ──────────────────────────────────────────────────────

describe('getAllCancellations', () => {
    it('should return all cancellations with status 200', async () => {
        const fakeList = [{ ...validBody }, { ...validBody }];
        RequestCancellation.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeList)
        });

        const req = {};
        const res = mockRes();

        await getAllCancellations(req, res, mockNext);

        expect(RequestCancellation.find).toHaveBeenCalledWith({});
        expect(res.json).toHaveBeenCalledWith(fakeList);
    });

    it('should call next on error', async () => {
        RequestCancellation.find.mockReturnValue({
            sort: jest.fn().mockImplementation(() => Promise.reject(new Error('DB error')))
        });

        const req = {};
        const res = mockRes();

        await getAllCancellations(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});

// ─── getCancellationById ──────────────────────────────────────────────────────

describe('getCancellationById', () => {
    it('should return a cancellation with status 200', async () => {
        const fakeCancellation = { ...validBody };
        RequestCancellation.findById.mockResolvedValue(fakeCancellation);

        const req = { params: { id: validId } };
        const res = mockRes();

        await getCancellationById(req, res, mockNext);

        expect(RequestCancellation.findById).toHaveBeenCalledWith(validId);
        expect(res.json).toHaveBeenCalledWith(fakeCancellation);
    });

    it('should return 404 if cancellation not found', async () => {
        RequestCancellation.findById.mockResolvedValue(null);

        const req = { params: { id: validId } };
        const res = mockRes();

        await getCancellationById(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Cancellation not found'));
    });

    it('should call next on error', async () => {
        RequestCancellation.findById.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: validId } };
        const res = mockRes();

        await getCancellationById(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});

// ─── updateCancellation ───────────────────────────────────────────────────────

describe('updateCancellation', () => {
    it('should update a cancellation and return status 200', async () => {
        const mockUpdatedCancellation = { ...validBody };
        RequestCancellation.findByIdAndUpdate.mockResolvedValue(mockUpdatedCancellation);

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateCancellation(req, res, mockNext);

        expect(RequestCancellation.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            validBody,
            { new: true, runValidators: true }
        );
        expect(res.json).toHaveBeenCalledWith(mockUpdatedCancellation);
    });

    it('should return 404 if cancellation not found', async () => {
        RequestCancellation.findByIdAndUpdate.mockResolvedValue(null);

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateCancellation(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Cancellation not found'));
    });

    it('should return 400 on update error', async () => {
        RequestCancellation.findByIdAndUpdate.mockRejectedValue(new Error('Validation error'));

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateCancellation(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalledWith(new Error('Validation error'));
    });
});

// ─── deleteCancellation ───────────────────────────────────────────────────────

describe('deleteCancellation', () => {
    it('should delete a cancellation and return status 200', async () => {
        const mockDeletedCancellation = { ...validBody };
        RequestCancellation.findByIdAndDelete.mockResolvedValue(mockDeletedCancellation);

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteCancellation(req, res, mockNext);

        expect(RequestCancellation.findByIdAndDelete).toHaveBeenCalledWith(validId);
        expect(res.json).toHaveBeenCalledWith({ message: 'Cancellation deleted successfully' });
    });

    it('should return 404 if cancellation not found', async () => {
        RequestCancellation.findByIdAndDelete.mockResolvedValue(null);

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteCancellation(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Cancellation not found'));
    });

    it('should call next on error', async () => {
        RequestCancellation.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteCancellation(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});