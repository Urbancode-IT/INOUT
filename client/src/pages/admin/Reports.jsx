import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/api";
import { Home as WFHIcon } from '@mui/icons-material';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import html2pdf from 'html2pdf.js';
import { Button } from "@mui/material";  


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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';



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
  const [holidays, setHolidays] = useState([]); // Add state for holidays
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
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth() + 1; // Months are 1-indexed in API
        
        const [logsRes, schedulesRes, holidaysRes] = await Promise.all([
          axios.get(API_ENDPOINTS.getRecentAttendanceLogs, { headers }),
          axios.get(API_ENDPOINTS.getSchedules, { headers }),
          axios.get(`${API_ENDPOINTS.getHolidaysByMonth}?year=${year}&month=${month}`, { headers })
        ]);
        
        setLogs(logsRes.data);
        setSchedules(schedulesRes.data);
        setHolidays(holidaysRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, selectedMonth]); // Add selectedMonth as dependency

  // Helper function to check if a date is a holiday
  const isHoliday = (date) => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toDateString() === date.toDateString();
    });
  };

  // Helper function to get holiday name for a date
  const getHolidayName = (date) => {
    const holiday = holidays.find(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toDateString() === date.toDateString();
    });
    return holiday ? holiday.name : null;
  };


  const [year, month] = [selectedMonth.getFullYear(), selectedMonth.getMonth()];
  const allDates = getDatesInMonth(year, month);

 
  const employees = [...new Set(logs.map((log) => log.employeeName || "Unknown"))]
    .filter(employee => 
      employee.toLowerCase().includes(searchTerm.toLowerCase())
    );
 const monthYearLabel = selectedMonth.toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

const fitToColumn = (data) => {
  const result = data[0].map((col, i) => {
    const maxLength = data.reduce((acc, row) => {
      const val = row[i] ? row[i].toString() : '';
      return Math.max(acc, val.length);
    }, col ? col.toString().length : 0);
    return { wch: maxLength + 2 }; // Add extra padding
  });
  return result;
};
const downloadDetailedExcel = () => {
   const wb = XLSX.utils.book_new();

  const summaryData = [
    ['Name', 'Position', 'Company', 'Total Days', 'Present', 'Absent', 'Late']
  ];

  // Build Summary Sheet Data
  employees.forEach((employee) => {
    const userSchedule = schedules.find(sch => sch.user?.name === employee);
    const weeklySchedule = userSchedule?.weeklySchedule || {};
    const stats = getEmployeeStats(employee, weeklySchedule);

    summaryData.push([
      employee,
      userSchedule?.user?.position || 'Position',
      userSchedule?.user?.company || 'Company',
      stats.scheduledWorkingDays,
      stats.presentCount,
      stats.absentCount,
      stats.lateCount
    ]);
  });

  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWS['!autofilter'] = { ref: "A1:G1" };
  summaryWS['!cols'] = fitToColumn(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");

  // Individual Employee Sheets
  employees.forEach((employee) => {
    const wsData = [
      ['Date', 'Day', 'CheckIn', 'CheckOut', 'WorkHours', 'Status', 'Late', 'EarlyLeave']
    ];

    const userSchedule = schedules.find(sch => sch.user?.name === employee);
    const weeklySchedule = userSchedule?.weeklySchedule || {};

    allDates.forEach((dateObj) => {
      const dateKey = dateObj.toDateString();
      const dayName = getDayName(dateObj);
      const attendance = grouped[employee]?.[dateKey];
      const checkIn = attendance?.checkIn;
      const checkOut = attendance?.checkOut;
      const scheduled = weeklySchedule[dayName];

      const checkInTime = checkIn
        ? new Date(checkIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      const checkOutTime = checkOut
        ? new Date(checkOut.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      let status = '—';
      if (isHoliday(dateObj)) {
  status = 'Leave';
} else if (scheduled?.isLeave && checkIn) {
  const officeName = checkIn.officeName?.toLowerCase() || '';
  const presentType = (!officeName.includes("velechery") && !officeName.includes("pallikaranai")) ? 'WFH' : 'Present';
  status = `${presentType} (Scheduled Leave)`;  // Mark both Present and Scheduled Leave
} else if (scheduled?.isLeave) {
  status = 'Leave';
} else if (checkIn) {
  const officeName = checkIn.officeName?.toLowerCase() || '';
  status = (!officeName.includes("velechery") && !officeName.includes("pallikaranai")) ? 'WFH' : 'Present';
} else if (dateObj.getDay() !== 0 && scheduled && !scheduled.isLeave) {
  status = 'Absent';
}

      let workHours = '';
      if (checkIn && checkOut) {
        const diff = new Date(checkOut.timestamp) - new Date(checkIn.timestamp);
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        workHours = `${h}h ${m}m`;
      }

      let isLate = '';
      let isEarly = '';
      if (checkIn && scheduled?.start) {
        const [schInH, schInM] = scheduled.start.split(":").map(Number);
        const schIn = new Date(dateObj);
        schIn.setHours(schInH, schInM, 0, 0);
        const actualIn = new Date(checkIn.timestamp);
        const schInWithGrace = new Date(schIn.getTime() + 10 * 60000);
        if (actualIn > schInWithGrace) isLate = 'Yes';
      }

      if (checkOut && scheduled?.end) {
        const [schOutH, schOutM] = scheduled.end.split(":").map(Number);
        const schOut = new Date(dateObj);
        schOut.setHours(schOutH, schOutM, 0, 0);
        const actualOut = new Date(checkOut.timestamp);
        if (actualOut < schOut) isEarly = 'Yes';
      }

      wsData.push([
        dateObj.toLocaleDateString(),
        dayName,
        
        checkInTime,
        checkOutTime,
        workHours,
        status,
        isLate,
        isEarly,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!autofilter'] = { ref: "A1:H1" };
    ws['!cols'] = fitToColumn(wsData);
    XLSX.utils.book_append_sheet(wb, ws, employee.substring(0, 31));
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(dataBlob, `Attendance_Report_${selectedMonth.getFullYear()}_${selectedMonth.getMonth() + 1}.xlsx`);
};





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
    const wfhDays = [];

    allDates.forEach((dateObj) => {
      const dateKey = dateObj.toDateString();
      const today = new Date();
      const isFuture = dateObj > today;
      const dayName = getDayName(dateObj);
      const scheduled = weeklySchedule[dayName];
      const isHolidayDate = isHoliday(dateObj);

      if (isFuture) return;

      // Calculate scheduled working days (excluding holidays, leaves and weekends)
      if (scheduled && !scheduled.isLeave && dateObj.getDay() !== 0 && !isHolidayDate) {
        scheduledWorkingDays++;
      }

      const attendance = grouped[employee]?.[dateKey];
      const checkIn = attendance?.checkIn;
      const checkOut = attendance?.checkOut;

      if (isHolidayDate) {
        // Count holidays as leaves
        leaveCount++;
      } else if (scheduled?.isLeave) {
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
          const schInWithGrace = new Date(schIn.getTime() + 10 * 60000); // +10 minutes

          if (actualIn > schInWithGrace) lateCount++;
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
      } else if (dateObj.getDay() !== 0 && !isHolidayDate) { // Not Sunday and not holiday
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
          <Grid item xs={12} md={6}>
              
  <Button variant="contained" color="primary" onClick={downloadDetailedExcel}>
  Download Detailed Excel
</Button>
          </Grid>
        </Grid>

<Box id="report-content" >
  <Stack direction="row" alignItems="center" spacing={2} mb={4}>
  <h1 className="text-2xl font-bold text-blue-600">
    
    {monthYearLabel} User wise Attendance Report
  </h1>
  
</Stack>



        {employees.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">
              {searchTerm ? "No matching employees found" : "No attendance data for this month"}
            </Typography>
          </Paper>
        ) : (
          employees.map((employee,index) => {
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
            
const userInfo = userSchedule?.user;

const position = userInfo?.position || "Position not specified";
const company = userInfo?.company || "Company not specified";
            const attendancePercentage = scheduledWorkingDays > 0 
              ? Math.round((presentCount / scheduledWorkingDays) * 100)
              : 0;
            
            return (
              <div key={employee} id={`employee-section-${index}`} style={{ marginBottom: "20px" }}>
              <Card key={employee} elevation={3} sx={{ mb: 4,border: '1px solid #ddd' }}>
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
                            {position}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {company}
                          </Typography>
                        </Box>
                         <Grid item xs={6} sm={4} md={3} >
                          <Paper elevation={1} sx={{  p: 2, mx: 6,border: '1px solid #ddd', textAlign: "center" }}>
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
                          <Paper elevation={1} sx={{ p: 2, textAlign: "center", border: '1px solid #ddd'}}>
                            <Typography variant="h6" color="primary">
                              {presentCount}
                            </Typography>
                            <Typography variant="body2">Present Days</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2,border: '1px solid #ddd', textAlign: "center" }}>
                            <Typography variant="h6" color="error">
                              {absentCount}
                            </Typography>
                            <Typography variant="body2">Absent Days</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2,border: '1px solid #ddd', textAlign: "center" }}>
                            <Typography variant="h6" color="info.main">
                              {leaveCount}
                            </Typography>
                            <Typography variant="body2">Leaves</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2,border: '1px solid #ddd', textAlign: "center" }}>
                            <Typography variant="h6" color="success.main">
                              {wfhCount}
                            </Typography>
                            <Typography variant="body2">WFH Days</Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2,border: '1px solid #ddd', textAlign: "center" }}>
                            <Typography variant="h6" color={attendancePercentage >= 90 ? "success.main" : "warning.main"}>
                              {attendancePercentage}%
                            </Typography>
                            <Typography variant="body2">Attendance</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2,border: '1px solid #ddd', textAlign: "center" }}>
                            <Typography variant="h6" color="warning.main">
                              {lateCount}
                            </Typography>
                            <Typography variant="body2">Late Arrivals</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                          <Paper elevation={1} sx={{ p: 2,border: '1px solid #ddd', textAlign: "center" }}>
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
                          const isHolidayDate = isHoliday(dateObj);
                          const holidayName = getHolidayName(dateObj);

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
                          } 
                           else if (isHolidayDate) {
                            status = holidayName || "Holiday";
                            statusColor = "info";
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
                              const schInWithGrace = new Date(schIn.getTime() + 10 * 60000);
                              if (actualIn > schInWithGrace) late = true;
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
  variant="outlined"
  sx={{ width: '100px', justifyContent: 'left' }} // Ensure fixed width
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
               </div>
            );
          })
        )}
      </Box>
      </Box>
    </LocalizationProvider>
    </ThemeProvider>
  );
};

export default Report;