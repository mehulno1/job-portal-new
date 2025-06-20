const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

// GET /api/jobs - List all jobs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM job ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// POST /api/jobs - Create new job
router.post('/', async (req, res) => {
  console.log(req.body);
  const {
    client_name, client_email, client_phone, job_received_date, mode_received,
    job_description, type_of_job, assigned_to, target_completion_date
  } = req.body;
  try {
    // Insert the job WITHOUT job_id
    const [result] = await db.query(
      `INSERT INTO job (
        client_name, client_email, client_phone, job_received_date, mode_received,
        job_description, type_of_job, assigned_to, target_completion_date, status,
        is_delivered, invoice_raised, payment_received
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_name,
        client_email,
        client_phone,
        job_received_date,
        mode_received,
        job_description,
        type_of_job,
        assigned_to,
        target_completion_date + "T00:00:00",
        'New',
        0,
        0,
        0
      ]
    );

    // Now update the job_id for this row
    const jobId = 'DC-' + result.insertId;
    await db.query('UPDATE job SET job_id = ? WHERE id = ?', [jobId, result.insertId]);

    res.json({ success: true, job_id: jobId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// PUT /api/jobs/:id - Update job (admin, invoice fields)
router.put('/:id', async (req, res) => {
  const { invoice_raised, invoice_amount, payment_received, status, type_of_job } = req.body;
  console.log("Update request body:", req.body);
  try {
    const params = [invoice_raised, invoice_amount, payment_received, status, type_of_job, req.params.id];
    console.log("SQL update params:", params);
    await db.query(
      'UPDATE job SET invoice_raised = ?, invoice_amount = ?, payment_received = ?, status = ?, type_of_job = ? WHERE id = ?',
      params
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /api/jobs/export - Export jobs to Excel
router.get('/export', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM job');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');
    worksheet.columns = Object.keys(rows[0] || {}).map(key => ({ header: key, key }));
    rows.forEach(row => worksheet.addRow(row));

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = column.header.length;
      column.eachCell?.({ includeEmpty: true }, cell => {
        const cellValue = cell.value ? cell.value.toString() : '';
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      column.width = maxLength + 2;
    });

    // Format date columns
    const dateColumns = ['created_at', 'updated_at', 'job_received_date', 'target_completion_date'];
    dateColumns.forEach(col => {
      const colObj = worksheet.getColumn(col);
      if (colObj) {
        colObj.numFmt = 'yyyy-mm-dd hh:mm:ss';
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: 'Export error', details: err.message });
  }
});

// GET /api/jobs/:id - Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM job WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// DELETE /api/jobs/:id - Delete a job
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM job WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /api/jobs/search - Search jobs with filters
router.get('/search', async (req, res) => {
  try {
    const {
      client_name,
      job_id,
      status,
      assigned_to,
      start_date,
      end_date
    } = req.query;

    let query = 'SELECT * FROM job WHERE 1=1';
    const params = [];

    if (client_name) {
      query += ' AND client_name LIKE ?';
      params.push(`%${client_name}%`);
    }
    if (job_id) {
      query += ' AND job_id LIKE ?';
      params.push(`%${job_id}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (assigned_to) {
      query += ' AND assigned_to LIKE ?';
      params.push(`%${assigned_to}%`);
    }
    if (start_date) {
      query += ' AND job_received_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND job_received_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY id DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /api/jobs/stats - Get job statistics
router.get('/stats', async (req, res) => {
  try {
    const [statusStats] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM job
      GROUP BY status
    `);

    const [monthlyStats] = await db.query(`
      SELECT 
        DATE_FORMAT(job_received_date, '%Y-%m') as month,
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_jobs,
        SUM(CASE WHEN invoice_raised = 1 THEN 1 ELSE 0 END) as invoiced_jobs,
        SUM(CASE WHEN payment_received = 1 THEN 1 ELSE 0 END) as paid_jobs
      FROM job
      GROUP BY DATE_FORMAT(job_received_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      status_stats: statusStats,
      monthly_stats: monthlyStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router; 