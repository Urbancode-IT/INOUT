import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Chip,
  CircularProgress,
  Paper,
  InputAdornment,
  Divider,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person,
  Schedule,
  AttachMoney,
  Save,
  Search,
  AccessTime,
  BeachAccess
} from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/api';



const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EmployeeSchedule = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API_ENDPOINTS.getSchedules, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

const handleChange = (empIndex, day, field, value) => {
  setEmployees(prevEmployees => {
    const updated = [...prevEmployees]; // shallow copy of employee array
    const employee = { ...updated[empIndex] }; // copy of specific employee

    const weeklySchedule = employee.weeklySchedule ? { ...employee.weeklySchedule } : {};
    const daySchedule = weeklySchedule[day] ? { ...weeklySchedule[day] } : {};

    daySchedule[field] = value;
    weeklySchedule[day] = daySchedule;
    employee.weeklySchedule = weeklySchedule;
    updated[empIndex] = employee;

    return updated;
  });
};

  const handleSalaryChange = (empIndex, value) => {
    const updated = [...employees];
    updated[empIndex].salary = parseFloat(value) || 0;
    setEmployees(updated);
  };

  const saveChanges = async (employee) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_ENDPOINTS.putUserSchedule(employee._id), {
        salary: employee.salary,
        weeklySchedule: employee.weeklySchedule,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Changes saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    }
  };

  const getDayColor = (day) => {
    const colors = {
      // Monday: '#1976d2',
      // Tuesday: '#388e3c',
      // Wednesday: '#f57c00',
      // Thursday: '#7b1fa2',
      // Friday: '#c2185b',
      // Saturday: '#d32f2f',
      // Sunday: '#303f9f'
    };
    return colors[day] || 'rgba(0,0,0, 0.6)';
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading employee schedules...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4,fontFamily: ` Montserrat` }}>
      <Box sx={{ mb: 4 }}>
        <h1 className="text-2xl font-bold text-blue-600">Employee Schedule Management</h1>
        <h4 className="text-lg text-gray-600 ">Manage employee schedules and salaries</h4>
       
      </Box>
      <TextField
  label="Search Employee"
  variant="outlined"
  size="medium"
  fullWidth
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <Search />
      </InputAdornment>
    ),
  }}
  sx={{ mb: 4 ,
    fontFamily:`Montserrat`
  }}
/>


      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {employees
  .filter(emp => emp.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  .map((emp, index) => (
          <Fade in timeout={300 + index * 100} key={emp._id}>
            <Card 
              elevation={3}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 8,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                sx={{
                  background: 'rgba(103, 108, 112, 0.2)',
                  p: 3
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Person sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: 'Montserrat', color:'#1976d2' }}>
                      {emp.user?.name || 'Unnamed Employee'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, color:'#1976d2' }}>
                      Employee ID: {emp._id?.slice(-6) || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Basic pay"
                    type="number"
                    value={emp.salary || ''}
                    onChange={(e) => handleSalaryChange(index, e.target.value)}
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
      fontFamily: 'Montserrat',
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Montserrat',
    },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>

                <Divider sx={{ my: 3 }}>
                  <Chip 
                    icon={<Schedule />} 
                    label="Weekly Schedule" 
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-input': {
      fontFamily: 'Montserrat',
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Montserrat',
    },
                      borderRadius: 2,
                      fontSize: '0.9rem',
                      py: 1
                    }}
                  />
                </Divider>

                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)'
                    },
                    gap: 2
                  }}
                >
                  {days.map((day) => {
                    const daySchedule = emp.weeklySchedule?.[day] || {};
                    return (
                      <Paper
                        key={day}
                        elevation={1}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(getDayColor(day), 0.2),
                          background: alpha(getDayColor(day), 0.02),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: alpha(getDayColor(day), 0.4),
                            background: alpha(getDayColor(day), 0.05),
                          }
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          sx={{ 
                            fontFamily: 'Montserrat',
                            color: getDayColor(day),
                            mb: 2,
                            textAlign: 'center'
                          }}
                        >
                          {day}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <TextField
                            label="Start Time"
                            type="time"
                            value={daySchedule.start || '09:00'}
                            onChange={(e) => handleChange(index, day, 'start', e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                           
                            sx={{ 
                              '& .MuiInputBase-input': {
      fontFamily: 'Montserrat',
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Montserrat',
    },mb: 3 }}
                          />
                          <TextField
                            label="End Time"
                            type="time"
                            value={daySchedule.end || '17:00'}
                            onChange={(e) => handleChange(index, day, 'end', e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{
                              '& .MuiInputBase-input': {
      fontFamily: 'Montserrat',
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Montserrat',
    },
                            }}
                            
                          />
                        </Box>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={daySchedule.isLeave || false}
                              onChange={(e) => handleChange(index, day, 'isLeave', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              
                              <Typography variant="body2" sx={{ fontFamily: 'Montserrat' }}>
                                Leave Day
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    );
                  })}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  onClick={() => saveChanges(emp)}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    },
                    boxShadow: '0 4px 15px rgba(42, 32, 152, 0.3)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Save Changes
                </Button>
              </CardActions>
            </Card>
          </Fade>
        ))}
      </Box>

      {employees.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary" sx={{fontFamily: 'Montserrat'}} gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{fontFamily: 'Montserrat'}}>
            Add employees to start managing their schedules
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default EmployeeSchedule;