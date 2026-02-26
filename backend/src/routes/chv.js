const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Get CHV dashboard data
router.get('/dashboard', authMiddleware, roleMiddleware('chv'), async (req, res) => {
  try {
    const chv_id = req.user.id;

    // Count total mothers assigned
    const [mothers] = await req.db.query(
      `SELECT id FROM mother_profiles WHERE assigned_chv_id = ?`,
      [chv_id]
    );

    // Get high-risk cases
    const [highRiskLogs] = await req.db.query(
      `SELECT DISTINCT mother_id FROM symptom_logs WHERE risk_level = 'HIGH' ORDER BY created_at DESC`
    );

    let highRiskCount = 0;
    if (highRiskLogs && highRiskLogs.length > 0) {
      const assignedMotherIds = mothers.map((m) => m.id);
      highRiskCount = highRiskLogs.filter((log) =>
        assignedMotherIds.includes(log.mother_id)
      ).length;
    }

    // Count unread alerts
    const [unreadAlerts] = await req.db.query(
      `SELECT id FROM alerts WHERE chv_id = ? AND is_read = false`,
      [chv_id]
    );

    // Count referrals this month
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const [monthlyReferrals] = await req.db.query(
      `SELECT id FROM referrals WHERE chv_id = ? AND created_at >= ?`,
      [chv_id, thisMonth.toISOString()]
    );

    res.json({
      success: true,
      total_mothers: mothers?.length || 0,
      high_risk_cases: highRiskCount,
      unread_alerts: unreadAlerts?.length || 0,
      referrals_this_month: monthlyReferrals?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching CHV dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
});

// Get high-risk alerts
router.get('/alerts', authMiddleware, roleMiddleware('chv'), async (req, res) => {
  try {
    const chv_id = req.user.id;

    // Get high-risk mothers assigned to this CHV
    const [assignedMothers] = await req.db.query(
      `SELECT user_id FROM mother_profiles WHERE assigned_chv_id = ?`,
      [chv_id]
    );

    if (!assignedMothers || assignedMothers.length === 0) {
      return res.json({ success: true, alerts: [] });
    }

    const motherIds = assignedMothers.map((m) => m.user_id);

    // Get latest high-risk logs with user details
    let placeholders = motherIds.map(() => '?').join(',');
    const [alerts] = await req.db.query(
      `SELECT sl.id, sl.mother_id, sl.risk_score, sl.risk_level, sl.symptoms, sl.created_at, u.first_name, u.last_name, u.phone
       FROM symptom_logs sl
       JOIN users u ON sl.mother_id = u.id
       WHERE sl.risk_level = 'HIGH' AND sl.mother_id IN (${placeholders})
       ORDER BY sl.created_at DESC
       LIMIT 20`,
      motherIds
    );

    // Format alerts
    const formattedAlerts = alerts?.map((alert) => ({
      id: alert.id,
      mother_id: alert.mother_id,
      mother_name: `${alert.first_name} ${alert.last_name}` || 'Unknown',
      phone: alert.phone || '',
      risk_score: alert.risk_score,
      risk_level: alert.risk_level,
      key_symptom: alert.symptoms
        ? JSON.parse(alert.symptoms)[0]?.name?.replace(/_/g, ' ')
        : 'Not specified',
      created_at: alert.created_at,
    })) || [];

    res.json({
      success: true,
      alerts: formattedAlerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message,
    });
  }
});

// Get all assigned mothers
router.get('/mothers', authMiddleware, roleMiddleware('chv'), async (req, res) => {
  try {
    const chv_id = req.user.id;

    // Get mothers assigned to this CHV with latest risk data
    const [mothers] = await req.db.query(
      `SELECT mp.user_id, mp.edd, mp.county, u.id, u.first_name, u.last_name, u.email, u.phone
       FROM mother_profiles mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.assigned_chv_id = ?`,
      [chv_id]
    );

    // Get latest risk for each mother
    let formattedMothers = [];
    if (mothers && mothers.length > 0) {
      for (const mother of mothers) {
        const [latestLogs] = await req.db.query(
          `SELECT risk_level, risk_score, created_at FROM symptom_logs
           WHERE mother_id = ?
           ORDER BY created_at DESC
           LIMIT 1`,
          [mother.user_id]
        );
        const latestLog = latestLogs[0];

        // Calculate weeks pregnant
        let weeksPregnant = 0;
        if (mother.edd) {
          const eddDate = new Date(mother.edd);
          const today = new Date();
          weeksPregnant = 40 - Math.floor((eddDate - today) / (7 * 24 * 60 * 60 * 1000));
          weeksPregnant = Math.max(0, Math.min(42, weeksPregnant));
        }

        formattedMothers.push({
          id: mother.user_id,
          full_name: `${mother.first_name} ${mother.last_name}` || 'Unknown',
          email: mother.email,
          phone: mother.phone,
          county: mother.county,
          weeks_pregnant: weeksPregnant,
          risk_level: latestLog?.risk_level || 'LOW',
          risk_score: latestLog?.risk_score || 0,
          last_log_date: latestLog?.created_at,
        });
      }
    }

    res.json({
      success: true,
      mothers: formattedMothers,
    });
  } catch (error) {
    console.error('Error fetching mothers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mothers',
      error: error.message,
    });
  }
});

// Mark alert as reviewed
router.put('/alerts/:alertId/mark-reviewed', authMiddleware, roleMiddleware('chv'), async (req, res) => {
  try {
    const { alertId } = req.params;

    await req.db.query(
      `UPDATE alerts SET is_read = true WHERE id = ?`,
      [alertId]
    );

    const [updated] = await req.db.query(
      `SELECT * FROM alerts WHERE id = ?`,
      [alertId]
    );

    res.json({
      success: true,
      message: 'Alert marked as reviewed',
      alert: updated[0],
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: error.message,
    });
  }
});

module.exports = router;
