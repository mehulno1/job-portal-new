import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  useTheme,
  alpha
} from "@mui/material";
import { Email, Phone, Person, AddCircleOutline, ArrowBack } from '@mui/icons-material';

const modeOptions = [
  "Email", "Phone", "WhatsApp", "Physical Documents", "Other"
];

const assignees = [
  "Aanya Patel", "Rohan Mehta", "Priya Shah", "Karan Desai", "Sneha Joshi"
];

const JobEntryForm = () => {
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    job_received_date: new Date().toISOString().slice(0, 10),
    mode_received: "",
    job_description: "",
    type_of_job: "",
    assigned_to: "",
    target_completion_date: ""
  });
  const [typeOptions, setTypeOptions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const theme = useTheme();

  const formStyles = {
    paper: {
      p: { xs: 2, sm: 4 },
      borderRadius: 3,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      background: '#fff',
      maxWidth: 600,
      mx: 'auto',
      mt: 6,
    },
    sectionTitle: {
      mt: 3,
      mb: 1,
      color: theme.palette.primary.main,
      fontWeight: 600,
      fontSize: 18,
      letterSpacing: 0.5,
    },
    field: {
      mb: 2,
      '& .MuiOutlinedInput-root': {
        background: '#fafbfc',
        borderRadius: 2,
        '&:hover fieldset': {
          borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
        },
      },
    },
    buttonRow: {
      mt: 4,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 2,
    },
    submitButton: {
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      px: 4,
      py: 1.5,
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
      color: '#fff',
      boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
      '&:hover': {
        background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      },
    },
    cancelButton: {
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      px: 4,
      py: 1.5,
      borderColor: theme.palette.grey[300],
      color: theme.palette.text.primary,
      background: '#f5f5f5',
      '&:hover': {
        borderColor: theme.palette.grey[500],
        backgroundColor: alpha(theme.palette.grey[400], 0.15),
      },
    },
    background: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f8fafd 100%)',
      py: 6,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mb: 2,
      color: theme.palette.primary.main,
      fontWeight: 700,
      fontSize: 28,
      letterSpacing: 1,
      justifyContent: 'center',
    },
    divider: {
      my: 2,
      borderColor: theme.palette.grey[200],
    },
  };

  useEffect(() => {
    if (!user || !(user.role === "user" || user.role === "admin")) {
      navigate("/");
      return;
    }
    fetchTypes();
    // eslint-disable-next-line
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/codes");
      setTypeOptions(res.data);
    } catch {
      setTypeOptions([]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.client_name.trim()) errors.client_name = "Client name is required";
    if (!form.client_email.trim()) errors.client_email = "Client email is required";
    else if (!/\S+@\S+\.\S+/.test(form.client_email)) errors.client_email = "Invalid email format";
    if (!form.client_phone.trim()) errors.client_phone = "Client phone is required";
    if (!form.mode_received) errors.mode_received = "Mode received is required";
    if (!form.type_of_job) errors.type_of_job = "Type of job is required";
    if (!form.assigned_to) errors.assigned_to = "Assigned to is required";
    if (!form.job_description.trim()) errors.job_description = "Job description is required";
    if (!form.target_completion_date) errors.target_completion_date = "Target completion date is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      await axios.post("http://localhost:5000/api/jobs", form);
      setSuccess("Job created successfully!");
      setTimeout(() => navigate("/user", { state: { user } }), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={formStyles.paper}>
        <Box sx={formStyles.header}>
          <AddCircleOutline sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
          Create New Job
        </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 1,
              '& .MuiAlert-icon': {
                color: theme.palette.error.main
              }
            }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 1,
              '& .MuiAlert-icon': {
                color: theme.palette.success.main
              }
            }}
          >
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={formStyles.sectionTitle}>
            Client Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Client Name"
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.client_name}
                helperText={validationErrors.client_name}
                sx={formStyles.field}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Client Email"
                name="client_email"
                value={form.client_email}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.client_email}
                helperText={validationErrors.client_email}
                sx={formStyles.field}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Client Phone"
                name="client_phone"
                value={form.client_phone}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.client_phone}
                helperText={validationErrors.client_phone}
                sx={formStyles.field}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={formStyles.sectionTitle}>
            Job Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Job Received Date" name="job_received_date" type="date" value={form.job_received_date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required sx={{ minWidth: 300 }}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Mode Received" name="mode_received" value={form.mode_received} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required error={!!validationErrors.mode_received} helperText={validationErrors.mode_received} sx={{ minWidth: 300 }}>
                {modeOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Type of Job" name="type_of_job" value={form.type_of_job} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required error={!!validationErrors.type_of_job} helperText={validationErrors.type_of_job} sx={{ minWidth: 300 }}>
                {typeOptions.map((option) => (
                  <MenuItem key={option.id} value={option.label}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField select label="Assigned To" name="assigned_to" value={form.assigned_to} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required error={!!validationErrors.assigned_to} helperText={validationErrors.assigned_to} sx={{ minWidth: 300 }}>
                {assignees.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Target Completion Date" name="target_completion_date" type="date" value={form.target_completion_date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required error={!!validationErrors.target_completion_date} helperText={validationErrors.target_completion_date} sx={{ minWidth: 300 }}/>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Job Description" name="job_description" value={form.job_description} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth multiline rows={3} required error={!!validationErrors.job_description} helperText={validationErrors.job_description} sx={{ minWidth: 300 }}/>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: 2 
          }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/user", { state: { user } })}
              sx={{ ...formStyles.button, ...formStyles.cancelButton }}
              startIcon={<ArrowBack />}
            >
              Back to Dashboard
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ ...formStyles.button, ...formStyles.submitButton }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutline />}
            >
              {loading ? "Creating..." : "Create Job"}
          </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default JobEntryForm;