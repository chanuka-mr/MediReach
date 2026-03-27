const {
  getAllPharmacies,
  getPharmacyById,
  createPharmacy,
  updatePharmacy,
  togglePharmacyStatus,
  bulkDeletePharmacies,
  getNearbyPharmacies,
  getPharmacyStats,
  exportPharmaciesCSV,
  generatePharmacyQR,
} = require('./Controllers/pharmacyController');

jest.mock('./Models/pharmacyModel', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  distinct: jest.fn(),
  updateMany: jest.fn(),
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
}));

const Pharmacy = require('./Models/pharmacyModel');
const QRCode = require('qrcode');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('pharmacyController.getAllPharmacies', () => {
  it('returns paginated pharmacies with status 200', async () => {
    const pharmacies = [{ name: 'A' }, { name: 'B' }];
    Pharmacy.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(pharmacies),
        }),
      }),
    });
    Pharmacy.countDocuments.mockResolvedValue(12);

    const req = { query: { page: '2', limit: '2', sort: 'name' } };
    const res = mockRes();

    await getAllPharmacies(req, res);

    expect(Pharmacy.find).toHaveBeenCalledWith({ isActive: true });
    expect(Pharmacy.countDocuments).toHaveBeenCalledWith({ isActive: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        results: 2,
      })
    );
  });

  it('returns 500 when database fails', async () => {
    Pharmacy.find.mockImplementation(() => {
      throw new Error('db failure');
    });

    const req = { query: {} };
    const res = mockRes();

    await getAllPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'db failure',
      })
    );
  });
});

describe('pharmacyController.getPharmacyById', () => {
  it('returns a pharmacy with status 200', async () => {
    Pharmacy.findById.mockResolvedValue({ name: 'City Care' });

    const req = { params: { id: '64a7f9e2b4c3a12d5e6f7890' } };
    const res = mockRes();

    await getPharmacyById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    );
  });

  it('returns 404 when pharmacy is not found', async () => {
    Pharmacy.findById.mockResolvedValue(null);

    const req = { params: { id: '64a7f9e2b4c3a12d5e6f7890' } };
    const res = mockRes();

    await getPharmacyById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'fail' })
    );
  });

  it('returns 400 for invalid ID format', async () => {
    Pharmacy.findById.mockRejectedValue({ name: 'CastError' });

    const req = { params: { id: 'bad-id' } };
    const res = mockRes();

    await getPharmacyById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid pharmacy ID format' })
    );
  });
});

describe('pharmacyController.createPharmacy', () => {
  const baseBody = {
    name: 'New Pharmacy',
    district: 'Colombo',
    location: { type: 'Point', coordinates: [79.8612, 6.9271] },
    contactNumber: '0771234567',
    email: 'new@pharmacy.com',
    operatingHours: { open: '08:00', close: '22:00' },
    pharmacistName: 'John Doe',
  };

  it('creates a pharmacy with status 201', async () => {
    Pharmacy.findOne.mockResolvedValue(null);
    Pharmacy.create.mockResolvedValue({ ...baseBody, _id: '1' });

    const req = { body: baseBody };
    const res = mockRes();

    await createPharmacy(req, res);

    expect(Pharmacy.findOne).toHaveBeenCalled();
    expect(Pharmacy.create).toHaveBeenCalledWith(baseBody);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 409 when nearby pharmacy already exists', async () => {
    Pharmacy.findOne.mockResolvedValue({ _id: 'existing' });

    const req = { body: baseBody };
    const res = mockRes();

    await createPharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'fail' })
    );
  });
});

describe('pharmacyController.updatePharmacy', () => {
  it('returns 404 when pharmacy not found', async () => {
    Pharmacy.findById.mockResolvedValue(null);

    const req = { params: { id: '64a7f9e2b4c3a12d5e6f7890' }, body: { name: 'Updated' } };
    const res = mockRes();

    await updatePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 409 when updated location conflicts', async () => {
    Pharmacy.findById.mockResolvedValue({ _id: '1', name: 'A' });
    Pharmacy.findOne.mockResolvedValue({ _id: '2' });

    const req = {
      params: { id: '64a7f9e2b4c3a12d5e6f7890' },
      body: { location: { coordinates: [80.0, 7.0] } },
    };
    const res = mockRes();

    await updatePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(Pharmacy.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});

describe('pharmacyController.togglePharmacyStatus', () => {
  it('toggles status and saves pharmacy', async () => {
    const save = jest.fn().mockResolvedValue(true);
    Pharmacy.findById.mockResolvedValue({
      _id: '1',
      name: 'Toggle Pharmacy',
      isActive: true,
      save,
    });

    const req = { params: { id: '64a7f9e2b4c3a12d5e6f7890' } };
    const res = mockRes();

    await togglePharmacyStatus(req, res);

    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('pharmacyController.bulkDeletePharmacies', () => {
  it('returns 400 if ids are missing', async () => {
    const req = { body: {} };
    const res = mockRes();

    await bulkDeletePharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deletes matching pharmacies and returns count', async () => {
    Pharmacy.find.mockResolvedValue([{ name: 'A' }, { name: 'B' }]);
    Pharmacy.deleteMany.mockResolvedValue({ deletedCount: 2 });

    const req = { body: { ids: ['1', '2'] } };
    const res = mockRes();

    await bulkDeletePharmacies(req, res);

    expect(Pharmacy.deleteMany).toHaveBeenCalledWith({ _id: { $in: ['1', '2'] } });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('pharmacyController.getNearbyPharmacies', () => {
  it('returns 400 when lat/lng are missing', async () => {
    const req = { query: {} };
    const res = mockRes();

    await getNearbyPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 with nearby pharmacies', async () => {
    Pharmacy.find.mockReturnValue({
      limit: jest.fn().mockResolvedValue([
        {
          location: { coordinates: [79.8612, 6.9271] },
          toObject: () => ({ name: 'NearOne', location: { coordinates: [79.8612, 6.9271] } }),
        },
      ]),
    });

    const req = { query: { lat: '6.9271', lng: '79.8612', radius: '5' } };
    const res = mockRes();

    await getNearbyPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    );
  });
});

describe('pharmacyController.getPharmacyStats', () => {
  it('returns stats dashboard data', async () => {
    Pharmacy.aggregate.mockResolvedValue([{ _id: 'Colombo', total: 2, active: 1, inactive: 1 }]);
    Pharmacy.countDocuments
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2);
    Pharmacy.distinct.mockResolvedValue(['Colombo', 'Kandy']);
    Pharmacy.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({ name: 'Latest', updatedAt: '2026-03-27T00:00:00Z' }),
    });

    const req = {};
    const res = mockRes();

    await getPharmacyStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    );
  });
});

describe('pharmacyController.exportPharmaciesCSV', () => {
  it('returns CSV with headers', async () => {
    Pharmacy.find.mockResolvedValue([
      {
        name: 'CSV Pharmacy',
        district: 'Colombo',
        contactNumber: '0711111111',
        email: 'csv@x.com',
        pharmacistName: 'A',
        operatingHours: { open: '08:00', close: '20:00' },
        isActive: true,
      },
    ]);

    const req = {};
    const res = mockRes();

    await exportPharmaciesCSV(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
});

describe('pharmacyController.generatePharmacyQR', () => {
  it('returns 404 when pharmacy not found', async () => {
    Pharmacy.findById.mockResolvedValue(null);

    const req = { params: { id: '64a7f9e2b4c3a12d5e6f7890' } };
    const res = mockRes();

    await generatePharmacyQR(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns generated QR data', async () => {
    Pharmacy.findById.mockResolvedValue({
      _id: '64a7f9e2b4c3a12d5e6f7890',
      name: 'QR Pharmacy',
      district: 'Colombo',
      contactNumber: '0711111111',
      location: { coordinates: [79.9, 6.9] },
    });
    QRCode.toDataURL.mockResolvedValue('data:image/png;base64,abc');

    const req = { params: { id: '64a7f9e2b4c3a12d5e6f7890' } };
    const res = mockRes();

    await generatePharmacyQR(req, res);

    expect(QRCode.toDataURL).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
