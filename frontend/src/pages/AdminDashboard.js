import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Button, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [editJob, setEditJob] = useState(null);
  const [invoiceFields, setInvoiceFields] = useState({ invoice_raised: "", invoice_amount: "", payment_received: "", status: "", type_of_job: "" });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [typeOptions, setTypeOptions] = useState([]);
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
    const res = await axios.get("http://localhost:5000/api/jobs");
    setJobs(res.data);
  };

  const fetchTypeOptions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/codes");
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
      type_of_job: job.type_of_job ?? ""
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        invoice_raised: Number(invoiceFields.invoice_raised),
        invoice_amount: Number(invoiceFields.invoice_amount),
        payment_received: Number(invoiceFields.payment_received),
        status: invoiceFields.status || "New",
        type_of_job: invoiceFields.type_of_job
      };
      console.log("Sending update payload:", payload);
      const response = await axios.put(`http://localhost:5000/api/jobs/${editJob.id}`, payload);
      console.log("Update response:", response.data);
      setEditJob(null);
      fetchJobs();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update job");
    }
  };

  const handleExport = () => {
    window.open("http://localhost:5000/api/jobs/export", "_blank");
  };

  const handleCreateJob = () => {
    navigate("/user/new", { state: { user: { role: "admin" } } });
  };

  const handleLogout = () => {
    navigate("/");
  };

  const normalizeStatus = s => (s || '').toLowerCase().replace(/[\s_]+/g, '-');
  const filteredJobs = jobs.filter(job =>
    (job.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      job.job_id?.toLowerCase().includes(search.toLowerCase())) &&
    (status ? normalizeStatus(job.status) === normalizeStatus(status) : true)
  );

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
                <TableCell>Date</TableCell>
                <TableCell>Job ID</TableCell>
                <TableCell>Received Date</TableCell>
                <TableCell>Client Name</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type of Job</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Invoice Raised</TableCell>
                <TableCell>Invoice Amount</TableCell>
                <TableCell>Payment Received</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.map(job => {
                console.log('Job status:', job.status);
                return (
                  <TableRow key={job.id}>
                    <TableCell>{job.created_at ? job.created_at.slice(0, 10) : ''}</TableCell>
                    <TableCell>{job.job_id}</TableCell>
                    <TableCell>{job.job_received_date?.slice(0, 10)}</TableCell>
                    <TableCell>{job.client_name}</TableCell>
                    <TableCell>{job.mode_received}</TableCell>
                    <TableCell>{job.job_description}</TableCell>
                    <TableCell>{job.type_of_job}</TableCell>
                    <TableCell>{job.status.replace(/-/g, ' ')}</TableCell>
                    <TableCell>{job.invoice_raised ? "Yes" : "No"}</TableCell>
                    <TableCell>{job.invoice_amount}</TableCell>
                    <TableCell>{job.payment_received ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handleEdit(job)}>Edit</Button>
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
        <DialogTitle>Edit Invoice Fields</DialogTitle>
        <DialogContent>
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
    </Container>
  );
};

export default AdminDashboard;
