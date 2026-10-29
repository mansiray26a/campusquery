import React from 'react';
import { NavLink } from 'react-router-dom';

const IconStats = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconQuestions = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconAnswers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconTags = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const IconReports = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const AdminSidebar = () => {
  return (
    <nav className="admin-sidebar" aria-label="Admin Navigation">
      <NavLink
        to="/admin"
        end
        className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
      >
        <IconStats /> Overview
      </NavLink>
      <NavLink
        to="/admin/users"
        className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
      >
        <IconUsers /> Manage Users
      </NavLink>
      <NavLink
        to="/admin/questions"
        className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
      >
        <IconQuestions /> Manage Questions
      </NavLink>
      <NavLink
        to="/admin/answers"
        className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
      >
        <IconAnswers /> Manage Answers
      </NavLink>
      <NavLink
        to="/admin/tags"
        className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
      >
        <IconTags /> Manage Tags
      </NavLink>
      <NavLink
        to="/admin/reports"
        className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
      >
        <IconReports /> Moderation Reports
      </NavLink>
    </nav>
  );
};

export default AdminSidebar;
