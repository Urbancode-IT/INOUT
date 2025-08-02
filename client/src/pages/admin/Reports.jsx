import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/api";
import { Home as WFHIcon } from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  EventAvailable as PresentIcon,
  EventBusy as AbsentIcon,
  Event as LeaveIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Business as CompanyIcon,
  Work as PositionIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  WorkOutline as WorkDaysIcon,
  AccessTime as ScheduledIcon,
  Warning as LateIcon,
  AlarmOn as EarlyIcon
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});


  


const getDatesInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const dates = [];
  while (date.getMonth() === month) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

const getDayName = (date) => {
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const Report = () => {
  const [logs, setLogs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [logsRes, schedulesRes] = await Promise.all([
          axios.get(API_ENDPOINTS.getRecentAttendanceLogs, { headers }),
          axios.get(API_ENDPOINTS.getSchedules, { headers })
        ]);
        setLogs(logsRes.data);
        setSchedules(schedulesRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const [year, month] = [selectedMonth.getFullYear(), selectedMonth.getMonth()];
  const allDates = getDatesInMonth(year, month);

  const employees = [...new Set(logs.map((log) => log.employeeName || "Unknown"))]
    .filter(employee => 
      employee.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredLogs = logs.filter((log) => {
    const date = new Date(log.timestamp);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const grouped = {};
  filteredLogs.forEach((log) => {
    const emp = log.employeeName || "Unknown";
    const dateKey = new Date(log.timestamp).toDateString();
    if (!grouped[emp]) grouped[emp] = {};
    if (!grouped[emp][dateKey]) grouped[emp][dateKey] = { checkIn: null, checkOut: null };
    if (log.type === "check-in") {
      if (!grouped[emp][dateKey].checkIn || new Date(log.timestamp) < new Date(grouped[emp][dateKey].checkIn.timestamp)) {
        grouped[emp][dateKey].checkIn = log;
      }
    }
    if (log.type === "check-out") {
      if (!grouped[emp][dateKey].checkOut || new Date(log.timestamp) > new Date(grouped[emp][dateKey].checkOut.timestamp)) {
        grouped[emp][dateKey].checkOut = log;
      }
    }
  });

  const getEmployeeStats = (employee, weeklySchedule) => {
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let wfhCount = 0;
    let lateCount = 0;
    let earlyCount = 0;
    let scheduledWorkingDays = 0;
    const wfhDays=[];

    allDates.forEach((dateObj) => {
      const dateKey = dateObj.toDateString();
      const today = new Date();
      const isFuture = dateObj > today;
      const dayName = getDayName(dateObj);
      const scheduled = weeklySchedule[dayName];

      if (isFuture) return;

      // Calculate scheduled working days (excluding leaves and weekends)
      if (scheduled && !scheduled.isLeave && dateObj.getDay() !== 0) {
        scheduledWorkingDays++;
      }

      const attendance = grouped[employee]?.[dateKey];
      const checkIn = attendance?.checkIn;
      const checkOut = attendance?.checkOut;

      if (scheduled?.isLeave) {
        leaveCount++;
      } else if (checkIn) {
        presentCount++;
         // Check for WFH (office name not "velechery" or "pallikaranai")
      const officeName = checkIn.officeName?.toLowerCase();
      const isWFH = officeName && 
                   !officeName.includes("velechery") && 
                   !officeName.includes("pallikaranai");
      
      if (isWFH) {
        wfhCount++;
        wfhDays.push(dateKey); // Track this as WFH day
      }
        // Check for late arrival or early departure
        if (scheduled?.start) {
          const [schInH, schInM] = scheduled.start.split(":").map(Number);
          const schIn = new Date(dateObj);
          schIn.setHours(schInH, schInM, 0, 0);
          const actualIn = new Date(checkIn.timestamp);
          if (actualIn > schIn) lateCount++;
        }

        if (checkOut && scheduled?.end) {
          const [schOutH, schOutM] = scheduled.end.split(":").map(Number);
          const schOut = new Date(dateObj);
          schOut.setHours(schOutH, schOutM, 0, 0);
          const actualOut = new Date(checkOut.timestamp);
          if (actualOut < schOut) earlyCount++;
        }

        if (checkIn.officeName?.toLowerCase().includes("home")) {
          wfhCount++;
        }
      } else if (dateObj.getDay() !== 0) { // Not Sunday
        absentCount++;
      }
    });

    return { 
      presentCount, 
      absentCount, 
      leaveCount, 
      wfhCount, 
      lateCount, 
      earlyCount,
      scheduledWorkingDays,
      wfhDays
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: "1800px", mx: "auto" }}>
        

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <DatePicker
              views={["year", "month"]}
              label="Select Month"
              value={selectedMonth}
              onChange={(newValue) => setSelectedMonth(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Employee"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
<Stack direction="row" alignItems="center" spacing={2} mb={4}>
          
          <h1 className="text-2xl font-bold text-blue-600"><CalendarIcon color="primary" sx={{ fontSize: 25 }} /> Monthly Attendance Report</h1>
          
        </Stack>
        {employees.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">
              {searchTerm ? "No matching employees found" : "No attendance data for this month"}
            </Typography>
          </Paper>
        ) : (
          employees.map((employee) => {
            const userSchedule = schedules.find(sch => sch.user?.name === employee);
            const weeklySchedule = userSchedule?.weeklySchedule || {};
            const { 
              presentCount, 
              absentCount, 
              leaveCount, 
              wfhCount, 
              lateCount, 
              earlyCount,
              scheduledWorkingDays
            } = getEmployeeStats(employee, weeklySchedule);
            
            const sampleLog = logs.find((log) => log.employeeName === employee);
            const attendancePercentage = scheduledWorkingDays > 0 
              ? Math.round((presentCount / scheduledWorkingDays) * 100)
              : 0;
            
            return (
              <Card key={employee} elevation={3} sx={{ mb: 4 }}>
                <CardContent>
                  {/* Employee Summary Section */}
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar sx={{ width: 60, height: 60 }}>
                          <PersonIcon fontSize="large" />
                        </Avatar>
                        <Box>
                          <Typography variant="h5">{employee}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {sampleLog?.position || "Position not specified"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {sampleLog?.company || "Company not specified"}
                          </Typography>
                        </Box>
                         <Grid item xs={6} sm={4} md={3} >
                          <Paper elevation={1} sx={{  p: 2, mx: 6, textAlign: "center" }}>
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                              <WorkDaysIcon color="action" />
                              <Typography variant="h6">
                                {scheduledWorkingDays}
                              </Typography>
                            </Stack>
                            <Typography variant="body2">Scheduled Work Days</Typography>
                          </Paper>
                        </Grid>
                      </Stack>

                      {/* {weeklySchedule && (
                        <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            <ScheduledIcon color="primary" sx={{ fontSize: 16, mr: 1 }} />
                            Weekly Schedule
                          </Typography>
                          <List dense>
                            {Object.entries(weeklySchedule).map(([day, time]) => (
                              <ListItem key={day} sx={{ py: 0 }}>
                                <ListItemText
                                  primary={`${day}: ${time.isLeave ? 'Leave' : `${time.start} - ${time.end}`}`}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      )} */}
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                       
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color="primary">
                              {presentCount}
                            </Typography>
                            <Typography variant="body2">Present Days</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color="error">
                              {absentCount}
                            </Typography>
                            <Typography variant="body2">Absent Days</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color="info.main">
                              {leaveCount}
                            </Typography>
                            <Typography variant="body2">Leaves</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color="success.main">
                              {wfhCount}
                            </Typography>
                            <Typography variant="body2">WFH Days</Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color={attendancePercentage >= 90 ? "success.main" : "warning.main"}>
                              {attendancePercentage}%
                            </Typography>
                            <Typography variant="body2">Attendance</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color="warning.main">
                              {lateCount}
                            </Typography>
                            <Typography variant="body2">Late Arrivals</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color="warning.main">
                              {earlyCount}
                            </Typography>
                            <Typography variant="body2">Early Departures</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Calendar View */}
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="center">Day</TableCell>
                          <TableCell align="center">Check-In</TableCell>
                          <TableCell align="center">Check-Out</TableCell>
                          <TableCell align="center">Scheduled</TableCell>
                          <TableCell align="center">Work Hours</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allDates.map((dateObj, idx) => {
                          const dateKey = dateObj.toDateString();
                          const today = new Date();
                          const isFuture = dateObj > today;
                          const dayName = getDayName(dateObj);
                          const scheduled = weeklySchedule[dayName];

                          const attendance = grouped[employee]?.[dateKey];
                          const checkIn = attendance?.checkIn;
                          const checkOut = attendance?.checkOut;

                          const checkInTime = checkIn
                            ? new Date(checkIn.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—";
                          const checkOutTime = checkOut
                            ? new Date(checkOut.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—";

                          let workHours = "—";
                          if (checkIn && checkOut) {
                            const start = new Date(checkIn.timestamp);
                            const end = new Date(checkOut.timestamp);
                            const diff = end - start;
                            const h = Math.floor(diff / (1000 * 60 * 60));
                            const m = Math.floor((diff / (1000 * 60)) % 60);
                            workHours = `${h}h ${m}m`;
                          }

                          let status = "—";
                          let statusColor = "default";
                          let late = false;
                          let early = false;
                          let isWFH = false;
                          if (isFuture) {
                            status = "";
                          } else if (scheduled?.isLeave) {
                            status = "Leave";
                            statusColor = "info";
                          } else if (checkIn) {
                            const officeName = checkIn.officeName?.toLowerCase() || '';
  isWFH = !officeName.includes("velechery") && !officeName.includes("pallikaranai");
  
  status = isWFH ? "Remote" : "Present";
  statusColor = isWFH ? "secondary" : "success";

                            // Check for late arrival or early departure
                            if (scheduled?.start) {
                              const [schInH, schInM] = scheduled.start.split(":").map(Number);
                              const schIn = new Date(dateObj);
                              schIn.setHours(schInH, schInM, 0, 0);
                              const actualIn = new Date(checkIn.timestamp);
                              if (actualIn > schIn) late = true;
                            }

                            if (checkOut && scheduled?.end) {
                              const [schOutH, schOutM] = scheduled.end.split(":").map(Number);
                              const schOut = new Date(dateObj);
                              schOut.setHours(schOutH, schOutM, 0, 0);
                              const actualOut = new Date(checkOut.timestamp);
                              if (actualOut < schOut) early = true;
                            }
                          } else if (dateObj.getDay() !== 0 && scheduled && !scheduled.isLeave) { // Not Sunday and scheduled to work
                            status = "Absent";
                            statusColor = "error";
                          }

                          if (isFuture) return null;
                          
  

                          return (
                            <TableRow key={idx} hover>
                              <TableCell>
                                {dateObj.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableCell>
                              <TableCell align="center">{dayName}</TableCell>
                              <TableCell align="center">
                                <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                                  {late && <LateIcon color="warning" fontSize="small" />}

                                  <Typography sx={{fontSize:"0.9rem"}}>{checkInTime}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                                  {early && <EarlyIcon color="warning" fontSize="small" />}
                                  
                                  <Typography sx={{fontSize:"0.9rem"}}>{checkOutTime}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="center">
                                {scheduled?.isLeave ? "Leave" : `${scheduled?.start || "—"} - ${scheduled?.end || "—"}`}
                              </TableCell>
                              <TableCell align="center">{workHours}</TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={status}
                                  color={statusColor}
                                  size="small"
                                  icon={
                                    status === "Remote" ? (
      <WFHIcon fontSize="small" />
    ) : status === "Present" ? (
      <PresentIcon fontSize="small" />
    ) : status === "Absent" ? (
      <AbsentIcon fontSize="small" />
    ) : (
      <LeaveIcon fontSize="small" />
    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
    </LocalizationProvider>
    </ThemeProvider>
  );
};

export default Report;