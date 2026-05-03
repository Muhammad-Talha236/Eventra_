import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Admin Control Center</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-blue-100 rounded shadow">Manage Events</div>
        <div className="p-4 bg-green-100 rounded shadow">Manage Users</div>
        <div className="p-4 bg-purple-100 rounded shadow">Staff Assignments</div>
      </div>
    </div>
  );
};

export default AdminDashboard;