import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container, Typography, Button, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from "@mui/material";

const UserDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
    } catch (err) {
      alert("Failed to fetch jobs");
    }
    setLoading(false);
  };

  const handleCreateJob = () => {
    navigate("/user/new", { state: { user } });
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Typography variant="h4">User Dashboard</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, mb: 2 }}
        onClick={handleCreateJob}
      >
        Create New Job
      </Button>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Received Date</TableCell>
                <TableCell>Job ID</TableCell>
                <TableCell>Client Name</TableCell>
                <TableCell>Mode Received</TableCell>
                <TableCell>Job Description</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.job_received_date?.slice(0, 10)}</TableCell>
                  <TableCell>{job.job_id}</TableCell>
                  <TableCell>{job.client_name}</TableCell>
                  <TableCell>{job.mode_received}</TableCell>
                  <TableCell>{job.job_description}</TableCell>
                  <TableCell>{job.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default UserDashboard;
