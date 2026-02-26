const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

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
    const query = `
      INSERT INTO referrals (mother_id, chv_id, facility, urgency, notes, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await req.db.query(query, [
      mother_id,
      chv_id,
      facility,
      urgency || 'normal',
      notes || '',
      'pending',
    ]);

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      referral_id: result.insertId,
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

    let query = `
      SELECT r.id, r.mother_id, r.facility, r.urgency, r.notes, r.status, r.created_at,
             u.first_name, u.last_name, u.phone, u.email
      FROM referrals r
      JOIN users u ON r.mother_id = u.id
      WHERE r.chv_id = ?
    `;
    const params = [chv_id];

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [referrals] = await req.db.query(query, params);

    const formattedReferrals = referrals?.map((ref) => ({
      id: ref.id,
      mother_id: ref.mother_id,
      mother_name: `${ref.first_name} ${ref.last_name}` || 'Unknown',
      phone: ref.phone,
      email: ref.email,
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

    await req.db.query(
      `UPDATE referrals SET status = ? WHERE id = ?`,
      [status, referralId]
    );

    const [updated] = await req.db.query(
      `SELECT * FROM referrals WHERE id = ?`,
      [referralId]
    );

    if (!updated || updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    res.json({
      success: true,
      message: 'Referral status updated successfully',
      referral: updated[0],
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
