/**
 * Dashboard - Redireciona para /app
 */

import { Navigate } from "react-router-dom";

const Dashboard = () => {
  return <Navigate to="/app" replace />;
};

export default Dashboard;
