const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Get CHV dashboard data
router.get('/dashboard', authMiddleware, roleMiddleware('chv'), async (req, res) => {
  try {
    const chv_id = req.user.id;

    // Count total mothers assigned
    const { data: mothers, error: mothersError } = await req.supabase
      .from('mother_profiles')
      .select('id')
      .eq('assigned_chv_id', chv_id);

    if (mothersError) {
      throw mothersError;
    }

    // Count high-risk cases
    const { data: highRiskMotherIds } = await req.supabase
      .from('symptom_logs')
      .select('mother_id')
      .eq('risk_level', 'HIGH')
      .order('created_at', { ascending: false });

    let highRiskCount = 0;
    if (highRiskMotherIds) {
      const assignedMotherIds = mothers.map((m) => m.id);
      highRiskCount = highRiskMotherIds.filter((log) =>
        assignedMotherIds.includes(log.mother_id)
      ).length;
    }

    // Count unread alerts
    const { data: unreadAlerts, error: alertsError } = await req.supabase
      .from('alerts')
      .select('id')
      .eq('chv_id', chv_id)
      .eq('is_read', false);

    if (alertsError) {
      throw alertsError;
    }

    // Count referrals this month
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const { data: monthlyReferrals, error: referralsError } = await req.supabase
      .from('referrals')
      .select('id')
      .eq('chv_id', chv_id)
      .gte('created_at', thisMonth.toISOString());

    if (referralsError) {
      throw referralsError;
    }

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
    const { data: assignedMothers } = await req.supabase
      .from('mother_profiles')
      .select('user_id')
      .eq('assigned_chv_id', chv_id);

    if (!assignedMothers || assignedMothers.length === 0) {
      return res.json({ success: true, alerts: [] });
    }

    const motherIds = assignedMothers.map((m) => m.user_id);

    // Get latest high-risk logs
    const { data: alerts, error } = await req.supabase
      .from('symptom_logs')
      .select(
        `
        id,
        mother_id,
        risk_score,
        risk_level,
        symptoms,
        created_at,
        users:mother_id(full_name, phone)
      `
      )
      .eq('risk_level', 'HIGH')
      .in('mother_id', motherIds)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    // Format alerts
    const formattedAlerts = alerts?.map((alert) => ({
      id: alert.id,
      mother_id: alert.mother_id,
      mother_name: alert.users?.full_name || 'Unknown',
      phone: alert.users?.phone || '',
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
    const { data: mothers, error } = await req.supabase
      .from('mother_profiles')
      .select(
        `
        user_id,
        edd,
        county,
        users:user_id(id, full_name, email, phone)
      `
      )
      .eq('assigned_chv_id', chv_id);

    if (error) {
      throw error;
    }

    // Get latest risk for each mother
    let formattedMothers = [];
    if (mothers) {
      for (const mother of mothers) {
        const { data: latestLog } = await req.supabase
          .from('symptom_logs')
          .select('risk_level, risk_score, created_at')
          .eq('mother_id', mother.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

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
          full_name: mother.users?.full_name || 'Unknown',
          email: mother.users?.email,
          phone: mother.users?.phone,
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

    const { data: updated, error } = await req.supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Alert marked as reviewed',
      alert: updated,
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
