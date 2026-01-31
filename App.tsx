import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfileSelectionPage from './pages/ProfileSelectionPage';
import AdminDashboard from './pages/AdminDashboard'; // Keep for legacy if needed, or remove
import AdminLandingPage from './pages/AdminLandingPage'
import AdminLogsPage from './pages/AdminLogsPage'
import AdminTeamsPage from './pages/AdminTeamsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import DailyRewardModal from './components/DailyRewardModal';
import ScrollToTop from './components/ScrollToTop';
import { usePosterMetrics } from './hooks/usePosterMetrics';
import { posters } from './data/posters';

// Pages
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import ProgramPage from './pages/ProgramPage';
import PrayersPage from './pages/PrayersPage';
import RoomsPage from './pages/Rooms';
import TitleDetails from './pages/TitleDetails';
import WatchPlayer from './pages/WatchPlayer';
import SmartGamesPage from './pages/SmartGamesPage';
import SmartGameLevel from './pages/SmartGameLevel';
import RemindersPage from './pages/RemindersPage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import KidsPage from './pages/KidsPage';
import MyListPage from './pages/MyListPage';
import TripAnthem from './pages/TripAnthem';
import MenuPage from './pages/MenuPage';
import NewsPage from './pages/NewsPage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import CommunityPage from './pages/CommunityPage';
import PolicyPage from './pages/PolicyPage';
import SubscriptionPage from './pages/SubscriptionPage';
import HelpPage from './pages/HelpPage';
import PhotosPage from './pages/PhotosPage';
import ImageGenPage from './pages/ImageGenPage';
import VeoPage from './pages/VeoPage';
import SettingsPage from './pages/SettingsPage';
import TeamChatPage from './pages/TeamChatPage';
import AchievementsPage from './pages/AchievementsPage';
import AdminPointsPage from './pages/AdminPointsPage';
import TeamChatPopup from './components/TeamChatPopup';

const App: React.FC = () => {
  // Data Fetching at Root Level
  const { analyzedPosters, isAnalyzing } = usePosterMetrics(posters);

  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLandingPage />
            </AdminRoute>
          } />
          <Route path="/admin/points" element={
            <AdminRoute>
              <AdminPointsPage />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/teams" element={<AdminRoute><AdminTeamsPage /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLogsPage /></AdminRoute>} />

          {/* Profile Selection (Intermediate Step) */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          <Route path="/profiles" element={
            <ProtectedRoute>
              <ProfileSelectionPage />
            </ProtectedRoute>
          } />

          {/* Protected User Routes (Under /app) */}
          <Route path="/app" element={
            <ProtectedRoute>
              <MainLayout analyzedPosters={analyzedPosters} isAnalyzing={isAnalyzing} />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<HomePage posters={analyzedPosters.filter(p => !p.isComingSoon)} />} />
            <Route path="movies" element={<MoviesPage posters={analyzedPosters} />} />
            <Route path="movies/:id" element={<TitleDetails posters={analyzedPosters} />} />

            <Route path="games" element={<GamesPage />} />
            <Route path="program" element={<ProgramPage />} />
            <Route path="agpeya" element={<PrayersPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="reminders" element={<RemindersPage />} />

            <Route path="watch/:id" element={<WatchPlayer posters={analyzedPosters} />} />

            <Route path="smart-games" element={<SmartGamesPage />} />
            <Route path="smart-games/:id" element={<SmartGameLevel />} />

            <Route path="series" element={<SeriesPage posters={analyzedPosters} />} />
            <Route path="kids" element={<KidsPage />} />
            <Route path="my-list" element={<MyListPage posters={analyzedPosters} />} />
            <Route path="coming-soon" element={<HomePage posters={analyzedPosters.filter(p => p.isComingSoon)} />} />
            <Route path="title/:id" element={<TitleDetails posters={analyzedPosters} />} />

            <Route path="she3ar-al-re7la" element={<TripAnthem />} />

            <Route path="prayers" element={<PrayersPage />} />
            <Route path="policy" element={<PolicyPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="gallery" element={<PhotosPage />} />
            <Route path="art" element={<ImageGenPage />} />
            <Route path="veo" element={<VeoPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="team-chat" element={<TeamChatPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/app/home" replace />} />
          <Route path="*" element={<Navigate to="/app/home" replace />} />

        </Routes>
        <DailyRewardModal />
        <TeamChatPopup />
      </AuthProvider>
    </Router>
  );
};

export default App;
