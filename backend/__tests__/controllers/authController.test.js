const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../../Controllers/authController');

jest.mock('../../Models/userModel');
const User = require('../../Models/userModel');

jest.mock('../../Utils/sendEmail');
const sendEmail = require('../../Utils/sendEmail');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authController.registerUser', () => {
  const validUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    contactNumber: '+94771234567'
  };

  it('should register a new user successfully', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ ...validUserData, _id: '123' });

    const req = { body: validUserData };
    const res = mockRes();

    await registerUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: validUserData.email });
    expect(User.create).toHaveBeenCalledWith(validUserData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: expect.any(String),
        name: validUserData.name,
        email: validUserData.email,
        token: expect.any(String)
      })
    );
  });

  it('should return 400 if user already exists', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing', email: validUserData.email });

    const req = { body: validUserData };
    const res = mockRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('should return 400 for invalid role', async () => {
    const invalidData = { ...validUserData, role: 'invalid' };

    const req = { body: invalidData };
    const res = mockRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid role specified' });
  });

  it('should return 400 for missing required fields', async () => {
    const incompleteData = { name: 'Test' };

    const req = { body: incompleteData };
    const res = mockRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please enter all required fields' });
  });

  it('should register pharmacy with required fields', async () => {
    const pharmacyData = {
      ...validUserData,
      role: 'pharmacy',
      pharmacyName: 'Test Pharmacy',
      licenseNumber: 'PH-2024-001'
    };

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ ...pharmacyData, _id: '123' });

    const req = { body: pharmacyData };
    const res = mockRes();

    await registerUser(req, res);

    expect(User.create).toHaveBeenCalledWith(pharmacyData);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should return 400 for pharmacy missing required fields', async () => {
    const incompletePharmacyData = {
      ...validUserData,
      role: 'pharmacy'
      // missing pharmacyName and licenseNumber
    };

    const req = { body: incompletePharmacyData };
    const res = mockRes();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pharmacy details are required' });
  });
});

describe('authController.loginUser', () => {
  const validLoginData = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    contactNumber: '+94771234567',
    matchPassword: jest.fn()
  };

  it('should login user successfully', async () => {
    User.findOne.mockResolvedValue(mockUser);
    mockUser.matchPassword.mockResolvedValue(true);

    const req = { body: validLoginData };
    const res = mockRes();

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: validLoginData.email });
    expect(mockUser.matchPassword).toHaveBeenCalledWith(validLoginData.password);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        token: expect.any(String)
      })
    );
  });

  it('should return 401 for invalid email', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: validLoginData };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });

  it('should return 401 for invalid password', async () => {
    User.findOne.mockResolvedValue(mockUser);
    mockUser.matchPassword.mockResolvedValue(false);

    const req = { body: validLoginData };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });

  it('should return 401 for missing credentials', async () => {
    const req = { body: { email: '', password: '' } };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });
});

describe('authController.forgotPassword', () => {
  const mockUser = {
    _id: '123',
    email: 'test@example.com',
    getResetPasswordOtp: jest.fn(),
    save: jest.fn()
  };

  it('should send OTP to user email', async () => {
    User.findOne.mockResolvedValue(mockUser);
    mockUser.getResetPasswordOtp.mockReturnValue('123456');
    mockUser.save.mockResolvedValue(true);
    sendEmail.mockResolvedValue(true);

    const req = { body: { email: 'test@example.com' } };
    const res = mockRes();

    await forgotPassword(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockUser.getResetPasswordOtp).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        subject: 'MediReach Password Reset OTP'
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'OTP sent to email' });
  });

  it('should return 404 if user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { email: 'nonexistent@example.com' } };
    const res = mockRes();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle email sending failure', async () => {
    User.findOne.mockResolvedValue(mockUser);
    mockUser.getResetPasswordOtp.mockReturnValue('123456');
    mockUser.save.mockResolvedValue(true);
    sendEmail.mockRejectedValue(new Error('Email failed'));

    const req = { body: { email: 'test@example.com' } };
    const res = mockRes();

    await forgotPassword(req, res);

    expect(mockUser.resetPasswordOtp).toBeUndefined();
    expect(mockUser.resetPasswordOtpExpire).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email could not be sent' });
  });
});

describe('authController.verifyOtp', () => {
  it('should verify valid OTP', async () => {
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update('123456').digest('hex');
    
    User.findOne.mockResolvedValue({
      email: 'test@example.com',
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: new Date(Date.now() + 120000) // 2 minutes from now
    });

    const req = { body: { email: 'test@example.com', otp: '123456' } };
    const res = mockRes();

    await verifyOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'OTP verified' });
  });

  it('should return 400 for invalid OTP', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { email: 'test@example.com', otp: 'wrong' } };
    const res = mockRes();

    await verifyOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired OTP' });
  });

  it('should return 400 for expired OTP', async () => {
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update('123456').digest('hex');
    
    User.findOne.mockResolvedValue({
      email: 'test@example.com',
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: new Date(Date.now() - 120000) // 2 minutes ago
    });

    const req = { body: { email: 'test@example.com', otp: '123456' } };
    const res = mockRes();

    await verifyOtp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: expect.any(Number) }
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired OTP' });
  });
});

describe('authController.resetPassword', () => {
  const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    contactNumber: '+94771234567',
    save: jest.fn()
  };

  it('should reset password with valid OTP', async () => {
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update('123456').digest('hex');
    
    const userWithSave = {
      ...mockUser,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: new Date(Date.now() + 120000),
      password: undefined,
      save: jest.fn().mockImplementation(function() {
        this.password = 'newpassword123';
        this.resetPasswordOtp = undefined;
        this.resetPasswordOtpExpire = undefined;
        return Promise.resolve(this);
      })
    };
    
    User.findOne.mockResolvedValue(userWithSave);

    const req = { 
      body: { 
        email: 'test@example.com', 
        otp: '123456', 
        password: 'newpassword123' 
      } 
    };
    const res = mockRes();

    await resetPassword(req, res);

    expect(userWithSave.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: mockUser._id,
        name: mockUser.name,
        token: expect.any(String)
      })
    );
  });

  it('should return 400 for invalid OTP', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { 
      body: { 
        email: 'test@example.com', 
        otp: 'wrong', 
        password: 'newpassword123' 
      } 
    };
    const res = mockRes();

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired OTP' });
  });

  it('should return 400 for short password', async () => {
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update('123456').digest('hex');
    
    User.findOne.mockResolvedValue({
      ...mockUser,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: new Date(Date.now() + 120000)
    });

    const req = { 
      body: { 
        email: 'test@example.com', 
        otp: '123456', 
        password: '123' 
      } 
    };
    const res = mockRes();

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 6 characters' });
  });
});
