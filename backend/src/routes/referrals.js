const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Create a referral
router.post('/create', authMiddleware, roleMiddleware('chv'), async (req, res) => {
  try {
    const { mother_id, facility, urgency, notes } = req.body;
    const chv_id = req.user.id;

    // Validation
    if (!mother_id || !facility) {
      return res.status(400).json({
        success: false,
        message: 'mother_id and facility are required',
      });
    }

    // Create referral record
    const { data: referral, error } = await req.supabase
      .from('referrals')
      .insert({
        mother_id,
        chv_id,
        facility,
        urgency: urgency || 'normal',
        notes: notes || '',
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      referral,
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create referral',
      error: error.message,
    });
  }
});

// Get referrals for CHV
router.get('/list', authMiddleware, roleMiddleware('chv'), async (req, res) => {
  try {
    const chv_id = req.user.id;
    const { status } = req.query; // Optional filter by status

    let query = req.supabase
      .from('referrals')
      .select(
        `
        id,
        mother_id,
        facility,
        urgency,
        notes,
        status,
        created_at,
        users:mother_id(full_name, phone, email)
      `
      )
      .eq('chv_id', chv_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: referrals, error } = await query;

    if (error) {
      throw error;
    }

    const formattedReferrals = referrals?.map((ref) => ({
      id: ref.id,
      mother_id: ref.mother_id,
      mother_name: ref.users?.full_name || 'Unknown',
      phone: ref.users?.phone,
      email: ref.users?.email,
      facility: ref.facility,
      urgency: ref.urgency,
      notes: ref.notes,
      status: ref.status,
      created_at: ref.created_at,
    })) || [];

    res.json({
      success: true,
      referrals: formattedReferrals,
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referrals',
      error: error.message,
    });
  }
});

// Update referral status
router.put('/:referralId/status', authMiddleware, roleMiddleware('chv'), async (req, res) => {
  try {
    const { referralId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status field is required',
      });
    }

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const { data: updated, error } = await req.supabase
      .from('referrals')
      .update({ status })
      .eq('id', referralId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    res.json({
      success: true,
      message: 'Referral status updated successfully',
      referral: updated,
    });
  } catch (error) {
    console.error('Error updating referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update referral',
      error: error.message,
    });
  }
});

module.exports = router;
