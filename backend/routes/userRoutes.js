const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust path if needed

// GET /api/users - return users with role 'employee'
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, name FROM user");
    res.json(rows);
  } catch (err) {
    console.error("🔥 Error fetching users:", err); // <-- full error
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

module.exports = router;
