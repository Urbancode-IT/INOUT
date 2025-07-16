import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed w-64 h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navbar */}
        <div className="fixed top-0 left-64 right-0 z-10 h-16 bg-white shadow">
          <TopNavbar />
        </div>

        {/* Page Content */}
        <main className="p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
