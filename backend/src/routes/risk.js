const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

// Get latest risk result
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    // For mothers, get their own latest result
    // For CHVs, they can query a specific mother
    let mother_id = user_id;
    if (req.user.role === 'chv' && req.query.mother_id) {
      mother_id = req.query.mother_id;
    }

    const query = `
      SELECT * FROM symptom_logs
      WHERE mother_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [logs] = await req.db.query(query, [mother_id]);

    if (!logs || logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No risk assessment found',
      });
    }

    const latestLog = logs[0];

    res.json({
      success: true,
      risk_score: latestLog.risk_score,
      risk_level: latestLog.risk_level,
      symptoms: latestLog.symptoms ? JSON.parse(latestLog.symptoms) : [],
      blood_pressure: latestLog.blood_pressure ? JSON.parse(latestLog.blood_pressure) : null,
      glucose: latestLog.glucose,
      general_feeling: latestLog.general_feeling,
      notes: latestLog.notes,
      created_at: latestLog.created_at,
    });
  } catch (error) {
    console.error('Error fetching latest risk result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk result',
      error: error.message,
    });
  }
});

// Get risk history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const limit = req.query.limit || 5;

    // For mothers, get their own history
    // For CHVs, they can query a specific mother
    let mother_id = user_id;
    if (req.user.role === 'chv' && req.query.mother_id) {
      mother_id = req.query.mother_id;
    }

    const query = `
      SELECT id, risk_score, risk_level, created_at FROM symptom_logs
      WHERE mother_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [history] = await req.db.query(query, [mother_id, parseInt(limit)]);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Error fetching risk history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk history',
      error: error.message,
    });
  }
});

module.exports = router;
