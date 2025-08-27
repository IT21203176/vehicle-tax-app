const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User (Agent or Admin)
exports.registerUser = async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, role: req.body.role });
    
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('Missing fields:', { name: !!name, email: !!email, password: !!password, role: !!role });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: role.toUpperCase() 
    });

    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Register Agent (Admin only endpoint)
exports.registerAgent = async (req, res) => {
  try {
    console.log('Agent registration attempt:', req.body.email);
    
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create agent
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: "AGENT" 
    });

    console.log('Agent created successfully:', user._id);

    res.status(201).json({ 
      message: "Agent registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Agent registration error:", err);
    res.status(500).json({ 
      message: "Server error during agent registration",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('Missing login credentials');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Find user by email
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log('User found:', { id: user._id, email: user.email, role: user.role });

    // Check password
    console.log('Checking password...');
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    console.log('Generating token...');
    const token = generateToken(user._id);
    console.log('Token generated successfully');

    res.json({ 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
    console.log('Login successful for:', email);
  } catch (err) {
    console.error("Login error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ 
      message: "Server error fetching profile",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};