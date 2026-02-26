const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { calculateRiskScore } = require('../services/riskScoringService');

// Log symptoms
router.post('/log', authMiddleware, roleMiddleware('mother'), async (req, res) => {
  try {
    const { symptoms, blood_pressure, glucose, general_feeling, notes } = req.body;
    const mother_id = req.user.id;

    // Calculate risk score
    const riskResult = calculateRiskScore(symptoms, blood_pressure, glucose);

    // Save symptom log
    const query = `
      INSERT INTO symptom_logs (mother_id, symptoms, blood_pressure, glucose, general_feeling, notes, risk_score, risk_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await req.db.query(query, [
      mother_id,
      JSON.stringify(symptoms),
      JSON.stringify(blood_pressure),
      glucose,
      general_feeling,
      notes,
      riskResult.score,
      riskResult.level,
    ]);

    // If risk is HIGH, create alerts for assigned CHVs
    if (riskResult.level === 'HIGH') {
      // Get assigned CHV
      const [motherProfile] = await req.db.query(
        `SELECT assigned_chv_id FROM mother_profiles WHERE user_id = ?`,
        [mother_id]
      );

      if (motherProfile && motherProfile[0]?.assigned_chv_id) {
        const chv_id = motherProfile[0].assigned_chv_id;

        // Get mother name
        const [user] = await req.db.query(
          `SELECT first_name, last_name FROM users WHERE id = ?`,
          [mother_id]
        );

        const fullName = user[0] ? `${user[0].first_name} ${user[0].last_name}` : 'Unknown';

        // Create alert
        const alertQuery = `
          INSERT INTO alerts (mother_id, chv_id, risk_level, message, is_read)
          VALUES (?, ?, ?, ?, ?)
        `;

        await req.db.query(alertQuery, [
          mother_id,
          chv_id,
          riskResult.level,
          `${fullName} has reported high-risk symptoms (Score: ${riskResult.score}/100)`,
          false,
        ]);
      }
    }

    res.json({
      success: true,
      message: 'Symptoms logged successfully',
      risk_score: riskResult.score,
      risk_level: riskResult.level,
      symptom_log_id: result.insertId,
    });
  } catch (error) {
    console.error('Error logging symptoms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log symptoms',
      error: error.message,
    });
  }
});

// Get symptom history
router.get('/history', authMiddleware, roleMiddleware('mother'), async (req, res) => {
  try {
    const mother_id = req.user.id;
    const limit = req.query.limit || 10;

    const query = `
      SELECT * FROM symptom_logs
      WHERE mother_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [symptoms] = await req.db.query(query, [mother_id, parseInt(limit)]);

    res.json({
      success: true,
      symptoms,
    });
  } catch (error) {
    console.error('Error fetching symptom history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch symptom history',
      error: error.message,
    });
  }
});

module.exports = router;
