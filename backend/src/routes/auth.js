const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const connection = await req.db.getConnection();
    
    try {
      // Check if user exists
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (users.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      // Create user
      const [userResult] = await connection.execute(
        'INSERT INTO users (id, email, full_name, phone, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, email, full_name, phone || null, role, password_hash]
      );

      if (!userResult.affectedRows) {
        throw new Error('Failed to create user');
      }

      // Create role-specific profile
      const profileId = uuidv4();

      if (role === 'mother') {
        const { edd, gravida, county } = req.body;

        if (!edd || !county) {
          return res.status(400).json({
            success: false,
            message: 'EDD and county are required for mothers',
          });
        }

        await connection.execute(
          'INSERT INTO mother_profiles (id, user_id, edd, gravida, county) VALUES (?, ?, ?, ?, ?)',
          [profileId, userId, edd, gravida || 1, county]
        );
      } else if (role === 'chv') {
        const { chv_id, facility, operational_area } = req.body;

        if (!chv_id || !facility) {
          return res.status(400).json({
            success: false,
            message: 'CHV ID and facility are required for CHVs',
          });
        }

        await connection.execute(
          'INSERT INTO chv_profiles (id, user_id, chv_id, facility, operational_area) VALUES (?, ?, ?, ?, ?)',
          [profileId, userId, chv_id, facility, operational_area || null]
        );
      }

      // Generate JWT
      const token = jwt.sign(
        { id: userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          email,
          full_name,
          role,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error.message,
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const connection = await req.db.getConnection();

    try {
      // Find user
      const [users] = await connection.execute(
        'SELECT id, email, full_name, role, password_hash FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const user = users[0];

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

// Verify token
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const connection = await req.db.getConnection();

    try {
      const [users] = await connection.execute(
        'SELECT id, email, full_name, role FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = users[0];

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message,
    });
  }
});

module.exports = router;
