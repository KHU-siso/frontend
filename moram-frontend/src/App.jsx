import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./pages/common/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AssignmentListPage from "./pages/assignments/AssignmentListPage";
import AssignmentDetailPage from "./pages/assignments/AssignmentDetailPage";
import CommunityPage from "./pages/community/CommunityPage";
import PostDetailPage from "./pages/community/PostDetailPage";
import PostWritePage from "./pages/community/PostWritePage";
import PlaceholderPage from "./pages/common/PlaceholderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assignments" element={<AssignmentListPage />} />
          <Route path="/assignments/:assignmentId" element={<AssignmentDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/write" element={<PostWritePage />} />
          <Route path="/community/:postId" element={<PostDetailPage />} />
          <Route path="/courses" element={<PlaceholderPage title="수업" />} />
          <Route path="/calendar" element={<PlaceholderPage title="시간표 / 캘린더" />} />
          <Route path="/quizzes" element={<PlaceholderPage title="퀴즈" />} />
          <Route path="/chat" element={<PlaceholderPage title="AI Q&A" />} />
          <Route path="/mypage" element={<PlaceholderPage title="마이페이지" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
