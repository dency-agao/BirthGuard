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
    const { data: symptomLog, error: logError } = await req.supabase
      .from('symptom_logs')
      .insert([
        {
          mother_id,
          symptoms: JSON.stringify(symptoms),
          blood_pressure: JSON.stringify(blood_pressure),
          glucose,
          general_feeling,
          notes,
          risk_score: riskResult.score,
          risk_level: riskResult.level,
        },
      ])
      .select()
      .single();

    if (logError) {
      throw logError;
    }

    // If risk is HIGH, create alerts for assigned CHVs
    if (riskResult.level === 'HIGH') {
      // Get assigned CHV
      const { data: motherProfile } = await req.supabase
        .from('mother_profiles')
        .select('assigned_chv_id')
        .eq('user_id', mother_id)
        .single();

      if (motherProfile?.assigned_chv_id) {
        // Get mother name
        const { data: user } = await req.supabase
          .from('users')
          .select('full_name')
          .eq('id', mother_id)
          .single();

        // Create alert
        await req.supabase
          .from('alerts')
          .insert([
            {
              mother_id,
              chv_id: motherProfile.assigned_chv_id,
              risk_level: riskResult.level,
              message: `${user?.full_name} has reported high-risk symptoms (Score: ${riskResult.score}/100)`,
              is_read: false,
            },
          ]);
      }
    }

    res.json({
      success: true,
      message: 'Symptoms logged successfully',
      risk_score: riskResult.score,
      risk_level: riskResult.level,
      symptom_log_id: symptomLog.id,
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

    const { data: symptoms, error } = await req.supabase
      .from('symptom_logs')
      .select('*')
      .eq('mother_id', mother_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

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
