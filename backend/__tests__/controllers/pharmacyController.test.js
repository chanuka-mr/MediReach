const {
  getAllPharmacies,
  getPharmacyById,
  searchPharmacies,
  getPharmaciesByDistrict,
  createPharmacy,
  updatePharmacy,
  partiallyUpdatePharmacy,
  togglePharmacyStatus,
  deletePharmacyPermanently,
  softDeletePharmacy,
  restorePharmacy,
  bulkDeletePharmacies,
  getNearbyPharmacies,
  getOpenNowPharmacies,
  get247Pharmacies,
  getPharmacyStats,
  bulkUpdatePharmacies,
  exportPharmaciesCSV,
  generatePharmacyQR,
} = require('../../Controllers/pharmacyController');

jest.mock('../../Models/pharmacyModel');
jest.mock('qrcode');
const Pharmacy = require('../../Models/pharmacyModel');
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

// ============= ORIGINAL PASSING TESTS =============

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
      expect.objectContaining({ status: 'success', results: 2 })
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
  });
});

describe('pharmacyController.getPharmacyById', () => {
  it('returns a pharmacy with status 200', async () => {
    Pharmacy.findById.mockResolvedValue({ name: 'City Care' });

    const req = { params: { id: '64a7f9e2b4c3a12d5e6f7890' } };
    const res = mockRes();

    await getPharmacyById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });

  it('returns 404 when pharmacy is not found', async () => {
    Pharmacy.findById.mockResolvedValue(null);

    const req = { params: { id: '64a7f9e2b4c3a12d5e6f7890' } };
    const res = mockRes();

    await getPharmacyById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'fail' }));
  });

  it('returns 400 for invalid ID format', async () => {
    Pharmacy.findById.mockRejectedValue({ name: 'CastError' });

    const req = { params: { id: 'bad-id' } };
    const res = mockRes();

    await getPharmacyById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('pharmacyController.createPharmacy', () => {
  const baseBody = {
    name: 'New Pharmacy',
    district: 'Colombo',
    location: { type: 'Point', coordinates: [79.8612, 6.9271] },
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
  });
});

describe('pharmacyController.updatePharmacy', () => {
  it('returns 404 when pharmacy not found', async () => {
    Pharmacy.findById.mockResolvedValue(null);

    const req = { params: { id: '1' }, body: { name: 'Updated' } };
    const res = mockRes();

    await updatePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 409 when updated location conflicts', async () => {
    Pharmacy.findById.mockResolvedValue({ _id: '1', name: 'A' });
    Pharmacy.findOne.mockResolvedValue({ _id: '2' });

    const req = {
      params: { id: '1' },
      body: { location: { coordinates: [80.0, 7.0] } },
    };
    const res = mockRes();

    await updatePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
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

    const req = { params: { id: '1' } };
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
  });
});

describe('pharmacyController.getPharmacyStats', () => {
  it('returns stats dashboard data', async () => {
    Pharmacy.aggregate.mockResolvedValue([{ _id: 'Colombo', total: 2, active: 1 }]);
    Pharmacy.countDocuments
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2);
    Pharmacy.distinct.mockResolvedValue(['Colombo', 'Kandy']);
    Pharmacy.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({ name: 'Latest' }),
    });

    const req = {};
    const res = mockRes();

    await getPharmacyStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
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
  });
});

describe('pharmacyController.generatePharmacyQR', () => {
  it('returns 404 when pharmacy not found', async () => {
    Pharmacy.findById.mockResolvedValue(null);

    const req = { params: { id: '1' } };
    const res = mockRes();

    await generatePharmacyQR(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns generated QR data', async () => {
    Pharmacy.findById.mockResolvedValue({
      _id: '1',
      name: 'QR Pharmacy',
      district: 'Colombo',
      contactNumber: '0711111111',
      location: { coordinates: [79.9, 6.9] },
    });
    QRCode.toDataURL.mockResolvedValue('data:image/png;base64,abc');

    const req = { params: { id: '1' } };
    const res = mockRes();

    await generatePharmacyQR(req, res);

    expect(QRCode.toDataURL).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ============= NEW COVERAGE TESTS =============

describe('pharmacyController.searchPharmacies', () => {
  it('should search pharmacies by name', async () => {
    Pharmacy.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([{ name: 'City Care' }]),
      }),
    });

    const req = { query: { query: 'City' } };
    const res = mockRes();

    await searchPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('pharmacyController.getPharmaciesByDistrict', () => {
  it('should get pharmacies by district', async () => {
    const mockPharmacies = [{ name: 'Pharmacy A' }];
    Pharmacy.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockPharmacies),
    });

    const req = { params: { district: 'Colombo' } };
    const res = mockRes();

    await getPharmaciesByDistrict(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('pharmacyController.partiallyUpdatePharmacy', () => {
  it('should partially update pharmacy', async () => {
    Pharmacy.findById.mockResolvedValue({ _id: '1', name: 'Old' });
    Pharmacy.findByIdAndUpdate.mockResolvedValue({ _id: '1', name: 'New' });

    const req = { params: { id: '1' }, body: { name: 'New' } };
    const res = mockRes();

    await partiallyUpdatePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('pharmacyController.deletePharmacyPermanently', () => {
  it('should permanently delete pharmacy', async () => {
    Pharmacy.findById.mockResolvedValue({ _id: '1', name: 'To Delete' });
    Pharmacy.findByIdAndDelete.mockResolvedValue({ _id: '1' });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await deletePharmacyPermanently(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('pharmacyController.softDeletePharmacy', () => {
  it('should soft delete pharmacy', async () => {
    const save = jest.fn().mockResolvedValue(true);
    Pharmacy.findById.mockResolvedValue({
      _id: '1',
      name: 'Active Pharmacy',
      isActive: true,
      save,
    });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await softDeletePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('pharmacyController.restorePharmacy', () => {
  it('should restore pharmacy', async () => {
    const save = jest.fn().mockResolvedValue(true);
    Pharmacy.findById.mockResolvedValue({
      _id: '1',
      isDeleted: true,
      save,
    });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await restorePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('pharmacyController.getOpenNowPharmacies', () => {
  it('should get open now pharmacies - regular hours (09:00 to 17:00)', async () => {
    // Mock current time to 12:00
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00'));

    const mockPharmacies = [
      {
        _id: '1',
        name: 'City Pharmacy',
        isActive: true,
        operatingHours: { open: '09:00', close: '17:00' },
      },
      {
        _id: '2',
        name: 'Night Pharmacy',
        isActive: true,
        operatingHours: { open: '22:00', close: '06:00' },
      },
      {
        _id: '3',
        name: '24/7 Pharmacy',
        isActive: true,
        operatingHours: { open: '00:00', close: '00:00' },
      },
    ];

    Pharmacy.find.mockResolvedValue(mockPharmacies);

    const req = {};
    const res = mockRes();

    await getOpenNowPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    // Should return 2 pharmacies: City Pharmacy (09:00-17:00, currently 12:00) and 24/7 Pharmacy
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        results: 2,
      })
    );

    jest.useRealTimers();
  });

  it('should get open now pharmacies - crossing midnight (22:00 to 06:00)', async () => {
    // Mock current time to 23:30
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T23:30:00'));

    const mockPharmacies = [
      {
        _id: '1',
        name: 'Night Pharmacy',
        isActive: true,
        operatingHours: { open: '22:00', close: '06:00' },
      },
      {
        _id: '2',
        name: 'Day Pharmacy',
        isActive: true,
        operatingHours: { open: '09:00', close: '17:00' },
      },
    ];

    Pharmacy.find.mockResolvedValue(mockPharmacies);

    const req = {};
    const res = mockRes();

    await getOpenNowPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    // Should return 1 pharmacy: Night Pharmacy (22:00-06:00, currently 23:30)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        results: 1,
      })
    );

    jest.useRealTimers();
  });
});

describe('pharmacyController.get247Pharmacies', () => {
  it('should get 24/7 pharmacies with open=00:00 and close=00:00', async () => {
    const mock247Pharmacies = [
      {
        _id: '1',
        name: '24/7 Pharmacy A',
        isActive: true,
        operatingHours: { open: '00:00', close: '00:00' },
      },
      {
        _id: '2',
        name: '24/7 Pharmacy B',
        isActive: true,
        operatingHours: { open: '00:00', close: '23:59' },
      },
    ];

    Pharmacy.find.mockResolvedValue(mock247Pharmacies);

    const req = {};
    const res = mockRes();

    await get247Pharmacies(req, res);

    expect(Pharmacy.find).toHaveBeenCalledWith({
      isActive: true,
      'operatingHours.open': '00:00',
      $or: [
        { 'operatingHours.close': '00:00' },
        { 'operatingHours.close': '23:59' },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        results: 2,
      })
    );
  });
});

describe('pharmacyController.bulkUpdatePharmacies', () => {
  it('should bulk update pharmacies', async () => {
    Pharmacy.updateMany.mockResolvedValue({ modifiedCount: 5, matchedCount: 5 });

    const req = { body: { pharmacyIds: ['1', '2'], updateData: { isActive: true } } };
    const res = mockRes();

    await bulkUpdatePharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 if pharmacyIds missing', async () => {
    const req = { body: { updateData: { isActive: false } } };
    const res = mockRes();

    await bulkUpdatePharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if updateData missing', async () => {
    const req = { body: { pharmacyIds: ['1'] } };
    const res = mockRes();

    await bulkUpdatePharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('pharmacyController - Additional Error Handling', () => {
  it('should handle getPharmacyById database error', async () => {
    Pharmacy.findById.mockImplementation(() => {
      throw new Error('connection error');
    });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await getPharmacyById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle deletePharmacyPermanently database error', async () => {
    Pharmacy.findById.mockImplementation(() => {
      throw new Error('db error');
    });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await deletePharmacyPermanently(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle partiallyUpdatePharmacy location conflict', async () => {
    Pharmacy.findById.mockResolvedValue({ _id: '1' });
    Pharmacy.findOne.mockResolvedValue({ _id: '2' });

    const req = {
      params: { id: '1' },
      body: { location: { coordinates: [80, 7] } },
    };
    const res = mockRes();

    await partiallyUpdatePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('should handle togglePharmacyStatus error', async () => {
    Pharmacy.findById.mockImplementation(() => {
      throw new Error('db error');
    });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await togglePharmacyStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle searchPharmacies error', async () => {
    Pharmacy.find.mockImplementation(() => {
      throw new Error('db error');
    });

    const req = { query: { query: 'test' } };
    const res = mockRes();

    await searchPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle getPharmaciesByDistrict error', async () => {
    Pharmacy.find.mockImplementation(() => {
      throw new Error('db error');
    });

    const req = { params: { district: 'Colombo' } };
    const res = mockRes();

    await getPharmaciesByDistrict(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle getOpenNowPharmacies error', async () => {
    Pharmacy.find.mockImplementation(() => {
      throw new Error('database error');
    });

    const req = {};
    const res = mockRes();

    await getOpenNowPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle get247Pharmacies error', async () => {
    Pharmacy.find.mockImplementation(() => {
      throw new Error('query error');
    });

    const req = {};
    const res = mockRes();

    await get247Pharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle exportPharmaciesCSV error', async () => {
    Pharmacy.find.mockImplementation(() => {
      throw new Error('export error');
    });

    const req = {};
    const res = mockRes();

    await exportPharmaciesCSV(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle generatePharmacyQR error', async () => {
    Pharmacy.findById.mockImplementation(() => {
      throw new Error('fetch error');
    });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await generatePharmacyQR(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle partiallyUpdatePharmacy not found', async () => {
    Pharmacy.findById.mockResolvedValue(null);

    const req = { params: { id: '1' }, body: { name: 'New' } };
    const res = mockRes();

    await partiallyUpdatePharmacy(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should handle deletePharmacyPermanently not found', async () => {
    Pharmacy.findById.mockResolvedValue(null);

    const req = { params: { id: '1' } };
    const res = mockRes();

    await deletePharmacyPermanently(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
