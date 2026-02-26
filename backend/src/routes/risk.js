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

    const { data: latestLog, error } = await req.supabase
      .from('symptom_logs')
      .select('*')
      .eq('mother_id', mother_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !latestLog) {
      return res.status(404).json({
        success: false,
        message: 'No risk assessment found',
      });
    }

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

    const { data: history, error } = await req.supabase
      .from('symptom_logs')
      .select('id, risk_score, risk_level, created_at')
      .eq('mother_id', mother_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

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
