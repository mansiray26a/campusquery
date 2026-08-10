const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      throw new Error('Username or email already exists');
    }

    // Only mansii143@gmail.com gets admin role
    const role = email === 'mansii143@gmail.com' ? 'admin' : 'student';

    const user = await User.create({
      username,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        bio: user.bio,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error('Invalid user details provided');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Admin hardcode logic
    if (email === 'mansii143@gmail.com' && password === 'mansi2226') {
      let adminUser = await User.findOne({ email });
      if (!adminUser) {
        adminUser = await User.create({
          username: 'Admin Mansi',
          email: 'mansii143@gmail.com',
          password: 'mansi2226',
          role: 'admin'
        });
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
      }
      return res.json({
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        reputation: adminUser.reputation,
        bio: adminUser.bio,
        profilePicture: adminUser.profilePicture,
        token: generateToken(adminUser._id)
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        bio: user.bio,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        bio: user.bio,
        profilePicture: user.profilePicture,
        savedQuestions: user.savedQuestions
      });
    } else {
      res.status(404);
      throw new Error('User account not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
