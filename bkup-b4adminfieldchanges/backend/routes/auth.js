const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: 'Mobile number required' });
  try {
    const [rows] = await db.query('SELECT * FROM user WHERE mobile_no = ?', [mobile]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = rows[0];
    res.json({ id: user.id, name: user.name, role: user.role, mobile: user.mobile });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router; 