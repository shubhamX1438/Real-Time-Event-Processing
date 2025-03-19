import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';

// Recharts imports
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/**
 * We'll keep these example overview cards the same.
 * You can customize or remove them as you like.
 */
const overviewData = [
  {
    title: 'Total Store Sales',
    value: '$1,880.54',
    change: '+13%',
    previousPeriod: '$1,660.21',
  },
  {
    title: 'Total Advertising Cost',
    value: '$4,220.91',
    change: '-75%',
    previousPeriod: '$16,883.64',
  },
  {
    title: 'Orders',
    value: '1,475',
    change: '-76%',
    previousPeriod: '6,145',
  },
  {
    title: 'Ecommerce Conversion',
    value: '2.3%',
    change: '+15%',
    previousPeriod: '2.0%',
  },
];

// Color palette for the Pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

/**
 * Transform each event into a separate data point for the line chart.
 * - X-axis: "time" (string from toLocaleTimeString())
 * - Y-axis: "sales" (numeric amount)
 */
function transformForLineChart(events) {
  // If no events, return a single fallback
  if (!events.length) {
    return [{ time: 'No Data', sales: 0 }];
  }

  return events.map((evt) => {
    const numericAmount =
      typeof evt.amount === 'string' ? parseFloat(evt.amount) : evt.amount;
    const timeStr = new Date(evt.timestamp).toLocaleTimeString(); 
    return {
      time: timeStr,
      sales: numericAmount,
    };
  });
}

/**
 * Transform each event for a Pie chart, grouping by product.
 * Summation of amounts for each product.
 */
function transformForPieChart(events) {
  if (!events.length) {
    return [{ name: 'No Data', value: 0 }];
  }

  const productMap = {};

  events.forEach((evt) => {
    const numericAmount =
      typeof evt.amount === 'string' ? parseFloat(evt.amount) : evt.amount;
    if (!productMap[evt.product]) {
      productMap[evt.product] = 0;
    }
    productMap[evt.product] += numericAmount;
  });

  const result = Object.keys(productMap).map((prod) => ({
    name: prod,
    value: productMap[prod],
  }));

  // If somehow empty, fallback
  return result.length ? result : [{ name: 'No Data', value: 0 }];
}

function AnalyticsDashboard() {
  const [salesEvents, setSalesEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/events');
        setSalesEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sales events:', err);
        setLoading(false);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Prepare chart data
  const lineData = transformForLineChart(salesEvents);
  const pieData = transformForPieChart(salesEvents);

  return (
    <div style={{ padding: '1rem' }}>
      {/* Overview Cards */}
      <Grid container spacing={2} style={{ marginBottom: '1rem' }}>
        {overviewData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="h4" color="primary">
                  {item.value}
                </Typography>
                <Typography
                  variant="body2"
                  color={item.change.startsWith('-') ? 'error' : 'success.main'}
                >
                  {item.change} vs. previous
                </Typography>
                <Typography variant="caption">
                  Previous: {item.previousPeriod}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Fixed-size Line Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Over Time
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <LineChart
                  width={600}
                  height={300}
                  data={lineData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Fixed-size Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales by Product
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <PieChart width={300} height={300}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Section */}
      <div style={{ marginTop: '2rem' }}>
        <Typography variant="h6" gutterBottom>
          Recent Sales Events
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.id}</TableCell>
                  <TableCell>{event.product}</TableCell>
                  <TableCell>{event.region}</TableCell>
                  <TableCell>${Number(event.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
