import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, token } = useAuth(); // Keep auth context
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔁 Add this new flag to track if we’re waiting on auth context
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    console.log('🧠 useEffect triggered with:', { token, user });
    if (token && user) {
      setAuthReady(true);
      console.log('✅ authReady set to true');
    } else {
      console.log('⏳ Waiting for auth...');
    }
  }, [token, user]);
  
  useEffect(() => {
    console.log('📌 Second useEffect – authReady:', authReady);
    if (!authReady) return;
  
    // Redirect if not admin - ensure this check happens *after* authReady is true
    if (!user?.isAdmin) {
      console.log('❌ Not admin, redirecting to /user-dashboard');
      navigate('/user-dashboard');
      return; // Stop execution if not admin
    }
  
    console.log('🚀 Fetching users from /admin/users...');
    const fetchUsers = async () => {
      setLoading(true); // Start loading indicator
      setError(''); // Clear previous errors
      try {
        const res = await api.get('/admin/users', {
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is passed correctly
          }
        });
        console.log('✅ User data:', res.data);
        setUsers(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch users:', err);
        setError('Failed to fetch users. Ensure you are logged in as an admin.'); // More specific error
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [authReady, user, token, navigate]); // Added dependencies
   
  return (
    // Adjusted Box padding and ensure text color is white
    <Box sx={{ p: 4, color: 'white', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Clinic Dashboard – User Management
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress sx={{ color: 'white' }} /> {/* White spinner */}
        </Box>
      ) : error ? (
        <Alert severity="error" variant="filled">{error}</Alert> // Filled alert for better visibility
      ) : (
        // Table styled for dark theme
        <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(30, 40, 55, 0.9)', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ '& .MuiTableCell-head': { backgroundColor: 'rgba(40, 50, 70, 1)', color: 'white', fontWeight: 'bold' } }}> {/* Darker header */}
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Registered</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ '& .MuiTableCell-body': { color: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(255, 255, 255, 0.23)' } }}> {/* Cell text and border color */}
              {users.map((user) => (
                <TableRow key={user._id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}> {/* Hover effect */}
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminDashboard;
