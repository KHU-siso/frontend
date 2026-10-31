import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PublicLayout from '../layouts/PublicLayout.jsx'
import LandingPage from '../pages/LandingPage.jsx'
import RoutePlaceholderPage from '../pages/RoutePlaceholderPage.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import AppLayout from '../layouts/AppLayout.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import SignupPage from '../pages/auth/SignupPage.jsx'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import SubjectChatsPage from '../pages/chat/SubjectChatsPage.jsx'
import MaterialsPage from '../pages/materials/MaterialsPage.jsx'
import StudyLayout from '../layouts/StudyLayout.jsx'
import StudySetupPage from '../pages/study/StudySetupPage.jsx'
import QuizSessionPage from '../pages/study/QuizSessionPage.jsx'
import StudyResultPage from '../pages/study/StudyResultPage.jsx'
import CoinRewardPage from '../pages/study/CoinRewardPage.jsx'
import WrongAnswersPage from '../pages/review/WrongAnswersPage.jsx'
import WardrobePage from '../pages/inventory/WardrobePage.jsx'
import MyPage from '../pages/profile/MyPage.jsx'
import RequireAuth from './RequireAuth.jsx'

const SubjectHomePage = lazy(() => import('../pages/materials/SubjectHomePage.jsx'))

// Navigation reservations only; these destination screens are not implemented.
const futurePages = [
  ['/about', '소개'],
  ['/support', '고객센터'],
  ['/faq', '자주 묻는 질문'],
]

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<RequireAuth />}>
      <Route element={<StudyLayout />}>
        <Route path="/wrong-answers" element={<WrongAnswersPage />} />
        <Route path="/study/setup" element={<StudySetupPage />} />
        <Route path="/study/session/:sessionId" element={<QuizSessionPage />} />
        <Route path="/study/session/:sessionId/result" element={<StudyResultPage />} />
        <Route path="/study/session/:sessionId/reward" element={<CoinRewardPage />} />
        <Route path="/study/review" element={<QuizSessionPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<SubjectChatsPage />} />
        <Route path="/chat" element={<SubjectChatsPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/materials/:subjectId" element={<Suspense fallback={<p className="service-page" role="status">과목 홈을 불러오는 중…</p>}><SubjectHomePage /></Suspense>} />
        <Route path="/shop" element={<WardrobePage />} />
        <Route path="/inventory" element={<Navigate to="/shop?tab=inventory" replace />} />
        <Route path="/mypage" element={<MyPage />} />
      </Route>
      </Route>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        {futurePages.map(([path, title]) => (
          <Route key={path} path={path} element={<RoutePlaceholderPage title={title} />} />
        ))}
        <Route path="*" element={<RoutePlaceholderPage notFound />} />
      </Route>
    </Routes>
  )
}
