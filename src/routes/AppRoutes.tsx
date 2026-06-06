import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/auth/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

import StudentDashboard from "../pages/student/StudentDashboard";
import SkillGapAnalysis from "../pages/student/SkillGapAnalysis";
import ElectiveRecommendations from "../pages/student/ElectiveRecommendations";
import CareerRecommendations from "../pages/student/CareerRecommendations";
import InterviewCoach from "../pages/student/InterviewCoach";
import ResumeAnalyzer from "../pages/student/ResumeAnalyzer";
import Profile from "../pages/student/Profile";

import AdminDashboard from "../pages/admin/AdminDashboard";
import CareerProfiles from "../pages/admin/CareerProfiles";
import SkillRequirements from "../pages/admin/SkillRequirements";
import Specializations from "../pages/admin/Specializations";
import ElectiveMappings from "../pages/admin/ElectiveMappings";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skill-gap"
          element={
            <ProtectedRoute allowedRole="student">
              <SkillGapAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/elective-recommendations"
          element={
            <ProtectedRoute allowedRole="student">
              <ElectiveRecommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/career-recommendations"
          element={
            <ProtectedRoute allowedRole="student">
              <CareerRecommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-coach"
          element={
            <ProtectedRoute allowedRole="student">
              <InterviewCoach />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume-analyzer"
          element={
            <ProtectedRoute allowedRole="student">
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/career-profiles"
          element={
            <ProtectedRoute allowedRole="admin">
              <CareerProfiles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/skill-requirements"
          element={
            <ProtectedRoute allowedRole="admin">
              <SkillRequirements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/specializations"
          element={
            <ProtectedRoute allowedRole="admin">
              <Specializations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/elective-mappings"
          element={
            <ProtectedRoute allowedRole="admin">
              <ElectiveMappings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}