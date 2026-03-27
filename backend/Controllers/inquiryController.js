const Inquiry = require('../Models/inquiryModel');

// Create a new inquiry (User facing)
exports.createInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { inquiry }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all inquiries (Admin facing)
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: inquiries.length,
      data: { inquiries }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update inquiry status or priority (Admin facing)
exports.updateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!inquiry) {
      return res.status(404).json({
        status: 'fail',
        message: 'No inquiry found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { inquiry }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete an inquiry (Admin facing)
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        status: 'fail',
        message: 'No inquiry found with that ID'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
// Get inquiries by email (User facing)
exports.getInquiriesByEmail = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ email: req.params.email.toLowerCase() }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: inquiries.length,
      data: { inquiries }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update inquiry by user (only if Pending)
exports.userUpdateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        status: 'fail',
        message: 'No inquiry found with that ID'
      });
    }

    if (inquiry.status !== 'Pending') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only pending inquiries can be edited'
      });
    }

    // Allow updating only specific fields
    const { subject, message } = req.body;
    inquiry.subject = subject || inquiry.subject;
    inquiry.message = message || inquiry.message;
    
    await inquiry.save();

    res.status(200).json({
      status: 'success',
      data: { inquiry }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete inquiry by user
exports.userDeleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        status: 'fail',
        message: 'No inquiry found with that ID'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
