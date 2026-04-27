import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import StaffSidebar from "../../components/nav/sidebar";
import DoctorManagement from "./DoctorManagement";

function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Determine active tab based on route
  const renderContent = () => {
    if (location.pathname === '/doctormanagement') {
      return <DoctorManagement />;
    }
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Staff Overview</h1>
        <p>Welcome to the staff dashboard. Select a tab to manage doctors or view other information.</p>
      </div>
    );
  };

  return (
    <div className="flex">
      <StaffSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
      <main className="flex-1 ml-64 lg:ml-0">
        {renderContent()}
      </main>
    </div>
  );
}

export default Dashboard;