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
  const { user, token } = useAuth();
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
  
    if (!user?.isAdmin) {
      console.log('❌ Not admin, redirecting to /user-dashboard');
      navigate('/user-dashboard');
      return;
    }
  
    console.log('🚀 Fetching users from /admin/users...');
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ User data:', res.data);
        setUsers(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch users:', err);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [authReady]); 
   
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Clinic Dashboard – User Management
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Admin</strong></TableCell>
                <TableCell><strong>Registered</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
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