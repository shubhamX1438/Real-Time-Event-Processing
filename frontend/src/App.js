import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import AnalyticsDashboard from './AnalyticsDashboard';

function App() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Sales Analytics Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <AnalyticsDashboard />
    </div>
  );
}

export default App;
