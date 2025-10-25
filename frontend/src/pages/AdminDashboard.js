import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Button, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, Snackbar, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [editJob, setEditJob] = useState(null);
  const [invoiceFields, setInvoiceFields] = useState({ invoice_raised: "", invoice_amount: "", payment_received: "", status: "", type_of_job: "", job_id: "", job_received_date: "", client_name: "", job_description: "" });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [typeOptions, setTypeOptions] = useState([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const navigate = useNavigate();

  const statusOptions = [
    "New",
    "In-Progress",
    "Completed",
    "On-Hold",
    "Cancelled"
  ];

  useEffect(() => {
    fetchJobs();
    fetchTypeOptions();
  }, []);

  const fetchJobs = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`);
    setJobs(res.data);
  };

  const fetchTypeOptions = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/codes`);
      setTypeOptions(res.data);
    } catch {
      setTypeOptions([]);
    }
  };

  const handleEdit = (job) => {
    setEditJob(job);
    setInvoiceFields({
      invoice_raised: job.invoice_raised ?? 0,
      invoice_amount: job.invoice_amount ?? 0,
      payment_received: job.payment_received ?? 0,
      status: job.status ?? "New",
      type_of_job: job.type_of_job ?? "",
      job_id: job.job_id ?? "",
      job_received_date: job.job_received_date ? job.job_received_date.slice(0, 10) : "",
      client_name: job.client_name ?? "",
      job_description: job.job_description ?? ""
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        invoice_raised: Number(invoiceFields.invoice_raised),
        invoice_amount: Number(invoiceFields.invoice_amount),
        payment_received: Number(invoiceFields.payment_received),
        status: invoiceFields.status || "New",
        type_of_job: invoiceFields.type_of_job,
        job_id: invoiceFields.job_id,
        job_received_date: invoiceFields.job_received_date,
        client_name: invoiceFields.client_name,
        job_description: invoiceFields.job_description
      };
      console.log("Sending update payload:", payload);
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/jobs/${editJob.id}`, payload);
      console.log("Update response:", response.data);
      
      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Close modal and refresh data
      setEditJob(null);
      await fetchJobs(); // Wait for data to refresh
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update job");
    }
  };

  const handleExport = () => {
    window.open(`${process.env.REACT_APP_API_URL}/api/jobs/export`, "_blank");
  };

  const handleCreateJob = () => {
    navigate("/user/new", { state: { user: { role: "admin" } } });
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const normalizeStatus = s => (s || '').toLowerCase().replace(/[\s_]+/g, '-');
  const filteredJobs = jobs.filter(job =>
    (job.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      job.job_id?.toLowerCase().includes(search.toLowerCase())) &&
    (status ? normalizeStatus(job.status) === normalizeStatus(status) : true)
  );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={700} color="primary">Admin Dashboard</Typography>
        <Box>
          <Button variant="contained" sx={{ mr: 2 }} onClick={handleCreateJob}>Create New Job</Button>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Search by Client or Job ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <Select
          value={status}
          onChange={e => setStatus(e.target.value)}
          displayEmpty
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          {statusOptions.map((option, idx) => (
            <MenuItem key={idx} value={option}>{option.replace(/-/g, ' ')}</MenuItem>
          ))}
        </Select>
        <Button variant="outlined" onClick={handleExport} sx={{ ml: 'auto' }}>
          Export to Excel
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { label: 'Date', key: 'created_at' },
                  { label: 'Job ID', key: 'job_id' },
                  { label: 'Received Date', key: 'job_received_date' },
                  { label: 'Client Name', key: 'client_name' },
                  { label: 'Description', key: 'job_description' },
                  { label: 'Type of Job', key: 'type_of_job' },
                  { label: 'Status', key: 'status' },
                  { label: 'Invoice Raised', key: 'invoice_raised' },
                  { label: 'Invoice Amount', key: 'invoice_amount' },
                  { label: 'Payment Received', key: 'payment_received' },
                  { label: 'Actions', key: null }
                ].map(col => (
                  <TableCell
                    key={col.key || col.label}
                    onClick={col.key ? () => handleSort(col.key) : undefined}
                    style={{ cursor: col.key ? 'pointer' : 'default', userSelect: 'none' }}
                  >
                    {col.label}
                    {col.key && sortBy === col.key && (
                      sortDirection === 'asc' ? ' ▲' : ' ▼'
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedJobs.map(job => {
                console.log('Job status:', job.status);
                return (
                  <TableRow key={job.id}>
                    <TableCell>{job.created_at ? job.created_at.slice(0, 10) : ''}</TableCell>
                    <TableCell>{job.job_id}</TableCell>
                    <TableCell>{job.job_received_date?.slice(0, 10)}</TableCell>
                    <TableCell>{job.client_name}</TableCell>
                    <TableCell>{job.job_description}</TableCell>
                    <TableCell>{job.type_of_job}</TableCell>
                    <TableCell>{job.status.replace(/-/g, ' ')}</TableCell>
                    <TableCell>{job.invoice_raised ? "Yes" : "No"}</TableCell>
                    <TableCell>{job.invoice_amount}</TableCell>
                    <TableCell>{job.payment_received ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handleEdit(job)}>Edit</Button>
                      <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(job.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Modal */}
      <Dialog open={!!editJob} onClose={() => setEditJob(null)}>
        <DialogTitle>Edit Job Fields</DialogTitle>
        <DialogContent>
          <TextField
            label="Client Name"
            value={invoiceFields.client_name}
            onChange={e => setInvoiceFields(f => ({ ...f, client_name: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Job Description"
            value={invoiceFields.job_description}
            onChange={e => setInvoiceFields(f => ({ ...f, job_description: e.target.value }))}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Job ID"
            value={invoiceFields.job_id}
            onChange={e => setInvoiceFields(f => ({ ...f, job_id: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Received Date"
            type="date"
            value={invoiceFields.job_received_date}
            onChange={e => setInvoiceFields(f => ({ ...f, job_received_date: e.target.value }))}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Invoice Raised"
            select
            value={invoiceFields.invoice_raised}
            onChange={e => setInvoiceFields(f => ({ ...f, invoice_raised: e.target.value }))}
            fullWidth
            margin="normal"
          >
            <MenuItem value={1}>Yes</MenuItem>
            <MenuItem value={0}>No</MenuItem>
          </TextField>
          <TextField
            label="Invoice Amount"
            type="number"
            value={invoiceFields.invoice_amount}
            onChange={e => setInvoiceFields(f => ({ ...f, invoice_amount: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Payment Received"
            select
            value={invoiceFields.payment_received}
            onChange={e => setInvoiceFields(f => ({ ...f, payment_received: e.target.value }))}
            fullWidth
            margin="normal"
          >
            <MenuItem value={1}>Yes</MenuItem>
            <MenuItem value={0}>No</MenuItem>
          </TextField>
          <TextField
            label="Type of Job"
            select
            value={invoiceFields.type_of_job}
            onChange={e => setInvoiceFields(f => ({ ...f, type_of_job: e.target.value }))}
            fullWidth
            margin="normal"
          >
            <MenuItem value="">Select Type of Job</MenuItem>
            {typeOptions.map((option, idx) => (
              <MenuItem key={idx} value={option.label || option.item || option.type_of_job}>
                {option.label || option.item || option.type_of_job}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Status"
            select
            value={invoiceFields.status}
            onChange={e => setInvoiceFields(f => ({ ...f, status: e.target.value }))}
            fullWidth
            margin="normal"
          >
            {statusOptions.map((option, idx) => (
              <MenuItem key={idx} value={option}>{option.replace(/-/g, ' ')}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditJob(null)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save Updates</Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={updateSuccess}
        autoHideDuration={3000}
        onClose={() => setUpdateSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setUpdateSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Job updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;
