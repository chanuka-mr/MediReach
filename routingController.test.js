// Mock the RequestRouting model at the very top
jest.mock('./backend/Model/RequestRouting');

const {
    createRouting,
    getAllRoutings,
    getRoutingById,
    updateRouting,
    deleteRouting,
} = require('./backend/Controllers/routingController');

const RequestRouting = require('./backend/Model/RequestRouting');

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
    pharmacy_id: 'pharm456',
    route_status: 'Sent'
};

const validId = '64a7f9e2b4c3a12d5e6f7890'; // valid 24-char hex

// ─── createRouting ────────────────────────────────────────────────────────────

describe('createRouting', () => {
    it('should create a routing entry successfully with status 201', async () => {
        const fakeRouting = { ...validBody, _id: validId };
        RequestRouting.create.mockResolvedValue(fakeRouting);

        const req = { body: validBody };
        const res = mockRes();

        await createRouting(req, res, mockNext);

        expect(RequestRouting.create).toHaveBeenCalledWith(validBody);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(fakeRouting);
    });

    it('should return 400 on creation error', async () => {
        RequestRouting.create.mockRejectedValue(new Error('Validation error'));

        const req = { body: validBody };
        const res = mockRes();

        await createRouting(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalledWith(new Error('Validation error'));
    });
});

// ─── getAllRoutings ───────────────────────────────────────────────────────────

describe('getAllRoutings', () => {
    it('should return all routing entries with status 200', async () => {
        const fakeList = [{ ...validBody }];
        RequestRouting.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeList)
        });

        const req = {};
        const res = mockRes();

        await getAllRoutings(req, res, mockNext);

        expect(RequestRouting.find).toHaveBeenCalledWith({});
        expect(res.json).toHaveBeenCalledWith(fakeList);
    });

    it('should call next on error', async () => {
        RequestRouting.find.mockReturnValue({
            sort: jest.fn().mockImplementation(() => Promise.reject(new Error('DB error')))
        });

        const req = {};
        const res = mockRes();

        await getAllRoutings(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});

// ─── getRoutingById ───────────────────────────────────────────────────────────

describe('getRoutingById', () => {
    it('should return a routing entry with status 200', async () => {
        const fakeRouting = { ...validBody };
        RequestRouting.findById.mockResolvedValue(fakeRouting);

        const req = { params: { id: validId } };
        const res = mockRes();

        await getRoutingById(req, res, mockNext);

        expect(RequestRouting.findById).toHaveBeenCalledWith(validId);
        expect(res.json).toHaveBeenCalledWith(fakeRouting);
    });

    it('should return 404 if routing entry not found', async () => {
        RequestRouting.findById.mockResolvedValue(null);

        const req = { params: { id: validId } };
        const res = mockRes();

        await getRoutingById(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Routing entry not found'));
    });

    it('should call next on error', async () => {
        RequestRouting.findById.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: validId } };
        const res = mockRes();

        await getRoutingById(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});

// ─── updateRouting ────────────────────────────────────────────────────────────

describe('updateRouting', () => {
    it('should update a routing entry and return status 200', async () => {
        const mockUpdatedRouting = { ...validBody };
        RequestRouting.findByIdAndUpdate.mockResolvedValue(mockUpdatedRouting);

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateRouting(req, res, mockNext);

        expect(RequestRouting.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            validBody,
            { new: true, runValidators: true }
        );
        expect(res.json).toHaveBeenCalledWith(mockUpdatedRouting);
    });

    it('should return 404 if routing entry not found', async () => {
        RequestRouting.findByIdAndUpdate.mockResolvedValue(null);

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateRouting(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Routing entry not found'));
    });

    it('should return 400 on update error', async () => {
        RequestRouting.findByIdAndUpdate.mockRejectedValue(new Error('Validation error'));

        const req = { params: { id: validId }, body: validBody };
        const res = mockRes();

        await updateRouting(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalledWith(new Error('Validation error'));
    });
});

// ─── deleteRouting ────────────────────────────────────────────────────────────

describe('deleteRouting', () => {
    it('should delete a routing entry and return status 200', async () => {
        const mockDeletedRouting = { ...validBody };
        RequestRouting.findByIdAndDelete.mockResolvedValue(mockDeletedRouting);

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteRouting(req, res, mockNext);

        expect(RequestRouting.findByIdAndDelete).toHaveBeenCalledWith(validId);
        expect(res.json).toHaveBeenCalledWith({ message: 'Routing entry deleted successfully' });
    });

    it('should return 404 if routing entry not found', async () => {
        RequestRouting.findByIdAndDelete.mockResolvedValue(null);

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteRouting(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(mockNext).toHaveBeenCalledWith(new Error('Routing entry not found'));
    });

    it('should call next on error', async () => {
        RequestRouting.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: validId } };
        const res = mockRes();

        await deleteRouting(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(new Error('DB error'));
    });
});