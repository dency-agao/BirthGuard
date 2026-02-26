const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Get mother dashboard data
router.get('/dashboard', authMiddleware, roleMiddleware('mother'), async (req, res) => {
  try {
    const mother_id = req.user.id;

    // Get user data
    const { data: user } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', mother_id)
      .single();

    // Get mother profile
    const { data: profile } = await req.supabase
      .from('mother_profiles')
      .select('*')
      .eq('user_id', mother_id)
      .single();

    // Get latest symptom log
    const { data: latestLog } = await req.supabase
      .from('symptom_logs')
      .select('*')
      .eq('mother_id', mother_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Count symptoms this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: thisWeekSymptoms, error: countError } = await req.supabase
      .from('symptom_logs')
      .select('id')
      .eq('mother_id', mother_id)
      .gte('created_at', oneWeekAgo.toISOString())
      .lte('created_at', new Date().toISOString());

    if (countError) {
      console.error('Error counting symptoms:', countError);
    }

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
        full_name: user.full_name,
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

    const { data: profile, error } = await req.supabase
      .from('mother_profiles')
      .select('*')
      .eq('user_id', mother_id)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      profile,
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

    const { data: updatedProfile, error } = await req.supabase
      .from('mother_profiles')
      .update({
        edd: edd || undefined,
        county: county || undefined,
        gravida: gravida || undefined,
      })
      .eq('user_id', mother_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
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
