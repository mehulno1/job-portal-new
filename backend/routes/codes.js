const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/codes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, CONCAT(item, " - ", hsn_code) AS label FROM codes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router; 