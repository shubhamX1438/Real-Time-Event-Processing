import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Grid
} from '@mui/material';

function SalesDashboard() {
  const [salesEvents, setSalesEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get('/events');
        setSalesEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales events:', error);
        setLoading(false);
      }
    };

    // Poll for events every 3 seconds
    const interval = setInterval(fetchSales, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate summary data for display (e.g., total sales)
  const totalSales = salesEvents.reduce((sum, event) => sum + event.amount, 0).toFixed(2);

  return (
    <div>
      <Grid container spacing={2} style={{ marginBottom: '1rem' }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Total Sales</Typography>
              <Typography variant="h4">${totalSales}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Additional summary cards can be added here */}
      </Grid>
      <Typography variant="h6" gutterBottom>
        Sales Events
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
                <TableCell>${event.amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default SalesDashboard;
