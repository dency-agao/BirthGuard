const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Get mother dashboard data
router.get('/dashboard', authMiddleware, roleMiddleware('mother'), async (req, res) => {
  try {
    const mother_id = req.user.id;

    // Get user data
    const [users] = await req.db.query(
      `SELECT * FROM users WHERE id = ?`,
      [mother_id]
    );
    const user = users[0];

    // Get mother profile
    const [profiles] = await req.db.query(
      `SELECT * FROM mother_profiles WHERE user_id = ?`,
      [mother_id]
    );
    const profile = profiles[0];

    // Get latest symptom log
    const [latestLogs] = await req.db.query(
      `SELECT * FROM symptom_logs WHERE mother_id = ? ORDER BY created_at DESC LIMIT 1`,
      [mother_id]
    );
    const latestLog = latestLogs[0];

    // Count symptoms this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [thisWeekSymptoms] = await req.db.query(
      `SELECT id FROM symptom_logs WHERE mother_id = ? AND created_at >= ? AND created_at <= ?`,
      [mother_id, oneWeekAgo.toISOString(), new Date().toISOString()]
    );

    // Calculate weeks pregnant
    let weeksPregnant = 0;
    if (profile?.edd) {
      const eddDate = new Date(profile.edd);
      const today = new Date();
      const weeksLate = Math.max(0, Math.floor((today - eddDate) / (7 * 24 * 60 * 60 * 1000)));
      weeksPregnant = 40 - (Math.floor((eddDate - today) / (7 * 24 * 60 * 60 * 1000)) - weeksLate);
      weeksPregnant = Math.max(0, Math.min(42, weeksPregnant));
    }

    res.json({
      success: true,
      risk_level: latestLog?.risk_level || 'LOW',
      risk_score: latestLog?.risk_score || 0,
      weeks_pregnant: weeksPregnant,
      next_appointment: profile?.next_appointment || null,
      symptoms_this_week: thisWeekSymptoms?.length || 0,
      user_info: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error fetching mother dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
});

// Get mother profile
router.get('/profile', authMiddleware, roleMiddleware('mother'), async (req, res) => {
  try {
    const mother_id = req.user.id;

    const [profiles] = await req.db.query(
      `SELECT * FROM mother_profiles WHERE user_id = ?`,
      [mother_id]
    );

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.json({
      success: true,
      profile: profiles[0],
    });
  } catch (error) {
    console.error('Error fetching mother profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

// Update mother profile
router.put('/profile', authMiddleware, roleMiddleware('mother'), async (req, res) => {
  try {
    const mother_id = req.user.id;
    const { edd, county, gravida } = req.body;

    const query = `
      UPDATE mother_profiles
      SET edd = ?, county = ?, gravida = ?
      WHERE user_id = ?
    `;

    await req.db.query(query, [
      edd || null,
      county || null,
      gravida || null,
      mother_id,
    ]);

    // Fetch updated profile
    const [profiles] = await req.db.query(
      `SELECT * FROM mother_profiles WHERE user_id = ?`,
      [mother_id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profiles[0],
    });
  } catch (error) {
    console.error('Error updating mother profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

module.exports = router;
