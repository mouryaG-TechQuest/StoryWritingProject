import React from 'react';
import './Dashboard.css';
import { Card } from '../../components/common/Card';

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <Card title="Stories Written">
          <p>12</p>
        </Card>
        <Card title="Total Words">
          <p>45,230</p>
        </Card>
        <Card title="Average Rating">
          <p>4.5/5</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
