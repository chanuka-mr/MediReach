const {
  createInquiry,
  getAllInquiries,
  updateInquiry,
  deleteInquiry,
  getInquiriesByEmail,
  userUpdateInquiry,
  userDeleteInquiry,
} = require('./Controllers/inquiryController');

jest.mock('./Models/inquiryModel', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const Inquiry = require('./Models/inquiryModel');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('inquiryController.createInquiry', () => {
  it('creates inquiry and returns 201', async () => {
    const mockInquiry = { _id: '1', name: 'Lihini' };
    Inquiry.create.mockResolvedValue(mockInquiry);

    const req = { body: { name: 'Lihini' } };
    const res = mockRes();

    await createInquiry(req, res);

    expect(Inquiry.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: { inquiry: mockInquiry },
    });
  });

  it('returns 400 on create error', async () => {
    Inquiry.create.mockRejectedValue(new Error('Validation failed'));

    const req = { body: {} };
    const res = mockRes();

    await createInquiry(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Validation failed',
    });
  });
});

describe('inquiryController.getAllInquiries', () => {
  it('returns all inquiries sorted by createdAt desc', async () => {
    const inquiries = [{ _id: '1' }, { _id: '2' }];
    const sort = jest.fn().mockResolvedValue(inquiries);
    Inquiry.find.mockReturnValue({ sort });

    const req = {};
    const res = mockRes();

    await getAllInquiries(req, res);

    expect(Inquiry.find).toHaveBeenCalledWith();
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: 2,
      data: { inquiries },
    });
  });

  it('returns 400 on fetch error', async () => {
    const sort = jest.fn().mockRejectedValue(new Error('DB down'));
    Inquiry.find.mockReturnValue({ sort });

    const req = {};
    const res = mockRes();

    await getAllInquiries(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'DB down',
    });
  });
});

describe('inquiryController.updateInquiry', () => {
  it('updates inquiry and returns 200', async () => {
    const updated = { _id: '1', status: 'Resolved' };
    Inquiry.findByIdAndUpdate.mockResolvedValue(updated);

    const req = { params: { id: '1' }, body: { status: 'Resolved' } };
    const res = mockRes();

    await updateInquiry(req, res);

    expect(Inquiry.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { status: 'Resolved' },
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: { inquiry: updated },
    });
  });

  it('returns 404 when inquiry not found', async () => {
    Inquiry.findByIdAndUpdate.mockResolvedValue(null);

    const req = { params: { id: 'missing' }, body: { status: 'Resolved' } };
    const res = mockRes();

    await updateInquiry(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'No inquiry found with that ID',
    });
  });
});

describe('inquiryController.deleteInquiry', () => {
  it('deletes inquiry and returns 204', async () => {
    Inquiry.findByIdAndDelete.mockResolvedValue({ _id: '1' });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await deleteInquiry(req, res);

    expect(Inquiry.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: null });
  });

  it('returns 404 when inquiry to delete not found', async () => {
    Inquiry.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id: 'missing' } };
    const res = mockRes();

    await deleteInquiry(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'No inquiry found with that ID',
    });
  });
});

describe('inquiryController.getInquiriesByEmail', () => {
  it('returns inquiries by normalized lowercase email', async () => {
    const inquiries = [{ _id: '1', email: 'a@b.com' }];
    const sort = jest.fn().mockResolvedValue(inquiries);
    Inquiry.find.mockReturnValue({ sort });

    const req = { params: { email: 'A@B.COM' } };
    const res = mockRes();

    await getInquiriesByEmail(req, res);

    expect(Inquiry.find).toHaveBeenCalledWith({ email: 'a@b.com' });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: 1,
      data: { inquiries },
    });
  });
});

describe('inquiryController.userUpdateInquiry', () => {
  it('returns 404 when inquiry not found', async () => {
    Inquiry.findById.mockResolvedValue(null);

    const req = { params: { id: 'missing' }, body: { subject: 's', message: 'm' } };
    const res = mockRes();

    await userUpdateInquiry(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'No inquiry found with that ID',
    });
  });

  it('returns 403 when inquiry is not pending', async () => {
    Inquiry.findById.mockResolvedValue({ status: 'Resolved' });

    const req = { params: { id: '1' }, body: { subject: 's', message: 'm' } };
    const res = mockRes();

    await userUpdateInquiry(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Only pending inquiries can be edited',
    });
  });

  it('updates subject and message when pending', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const inquiry = {
      status: 'Pending',
      subject: 'Old subject',
      message: 'Old message',
      save,
    };
    Inquiry.findById.mockResolvedValue(inquiry);

    const req = { params: { id: '1' }, body: { subject: 'New subject', message: 'New message' } };
    const res = mockRes();

    await userUpdateInquiry(req, res);

    expect(inquiry.subject).toBe('New subject');
    expect(inquiry.message).toBe('New message');
    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('inquiryController.userDeleteInquiry', () => {
  it('deletes inquiry and returns 204', async () => {
    Inquiry.findByIdAndDelete.mockResolvedValue({ _id: '1' });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await userDeleteInquiry(req, res);

    expect(Inquiry.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: null });
  });

  it('returns 404 when user delete inquiry is missing', async () => {
    Inquiry.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id: 'missing' } };
    const res = mockRes();

    await userDeleteInquiry(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'No inquiry found with that ID',
    });
  });
});
