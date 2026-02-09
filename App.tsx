import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppProvider';
import { AchievementsProvider } from './context/AchievementsContext';
import { GameProvider } from './context/GameContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { GameRoute } from './components/auth/GameRoute';
import MainLayout from './components/MainLayout';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import OneSignalManager from './components/OneSignalManager';
import { useMedia } from './hooks/useMedia';
import { usePosterMetrics } from './hooks/usePosterMetrics';

import TeamChatPopup from './components/TeamChatPopup';
import TeamBroadcastListener from './components/TeamBroadcastListener';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy Load Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));

const ProfileSelectionPage = lazy(() => import('./pages/ProfileSelectionPage'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const TeamsManager = lazy(() => import('./pages/admin/TeamsManager'));
const UsersManager = lazy(() => import('./pages/admin/UsersManager'));
const GamesManager = lazy(() => import('./pages/admin/GamesManager'));
const TransfersCenter = lazy(() => import('./pages/admin/TransfersCenter'));
const AuditLog = lazy(() => import('./pages/admin/AuditLog'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/Analytics'));
const AdminActivity = lazy(() => import('./pages/admin/AdminActivity'));
const GameBalancing = lazy(() => import('./pages/admin/GameBalancingFixed'));
const RolesManager = lazy(() => import('./pages/admin/RolesManager'));
const AnnouncementsManager = lazy(() => import('./pages/admin/AnnouncementsManager'));
const FeatureFlagsManager = lazy(() => import('./pages/admin/FeatureFlagsManager'));
const AdminSystemSettings = lazy(() => import('./pages/admin/AdminSystemSettings').then(module => ({ default: module.AdminSystemSettings })));
const AdminTeamDetails = lazy(() => import('./pages/admin/AdminTeamDetails'));
const AdminAchievements = lazy(() => import('./pages/admin/AdminAchievements'));
const AdminJourney = lazy(() => import('./pages/admin/AdminJourney'));
const PushNotifications = lazy(() => import('./pages/admin/PushNotifications'));
const WhatsAppManager = lazy(() => import('./pages/admin/WhatsAppManager'));
const PushDebug = lazy(() => import('./pages/admin/PushDebug'));
const NewsManager = lazy(() => import('./pages/admin/NewsManager'));
const PrayersManager = lazy(() => import('./pages/admin/PrayersManager'));
const MediaManager = lazy(() => import('./pages/admin/MediaManager'));
const RoomsManager = lazy(() => import('./pages/admin/RoomsManager'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));

// Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const SoloGameProverb = lazy(() => import('./pages/games/SoloGameProverb'));
const SoloGameVerse = lazy(() => import('./pages/games/SoloGameVerse'));
const SoloGameWho = lazy(() => import('./pages/games/SoloGameWho'));
const SoloGameSobek = lazy(() => import('./pages/games/SoloGameSobek'));
const MafiaGame = lazy(() => import('./pages/games/MafiaGame'));
const CharadesGame = lazy(() => import('./pages/games/CharadesGamePage'));
const PanicGame = lazy(() => import('./pages/games/PanicGame'));
const ForbiddenGame = lazy(() => import('./pages/games/ForbiddenGame'));
const StoryGame = lazy(() => import('./pages/games/StoryGame'));
const GamePlaceholder = lazy(() => import('./pages/games/GamePlaceholder'));
const VersusPage = lazy(() => import('./pages/VersusPage'));
const ProgramPage = lazy(() => import('./pages/ProgramPage'));
const PrayersPage = lazy(() => import('./pages/PrayersPage'));
const RoomsPage = lazy(() => import('./pages/Rooms'));
const TitleDetails = lazy(() => import('./pages/TitleDetails'));
const WatchPlayer = lazy(() => import('./pages/WatchPlayer'));
const SmartGamesPage = lazy(() => import('./pages/SmartGamesPage'));
const SmartGameLevel = lazy(() => import('./pages/SmartGameLevel'));
const RemindersPage = lazy(() => import('./pages/RemindersPage'));
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const SeriesPage = lazy(() => import('./pages/SeriesPage'));
const KidsPage = lazy(() => import('./pages/KidsPage'));
const MyListPage = lazy(() => import('./pages/MyListPage'));
const TripAnthem = lazy(() => import('./pages/TripAnthem'));
const InformationsPage = lazy(() => import('./pages/InformationsPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const PhotosPage = lazy(() => import('./pages/PhotosPage'));
const ImageGenPage = lazy(() => import('./pages/ImageGenPage'));
const VeoPage = lazy(() => import('./pages/VeoPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TeamChatPage = lazy(() => import('./pages/TeamChatPage'));
const RankingsPage = lazy(() => import('./pages/RankingsPage'));

const App: React.FC = () => {
  // Data Fetching at Root Level
  const { posters } = useMedia();
  const { analyzedPosters, isAnalyzing } = usePosterMetrics(posters);

  return (
    <Router>
      <GlobalErrorBoundary>
        <AuthProvider>
          <AppProvider>
            <OneSignalManager /> {/* Initialize OneSignal */}
            <AchievementsProvider>
              <GameProvider> {/* Inject Game Context */}
                <NotificationProvider>
                  <ScrollToTop />

                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>

                      {/* Individual Games - TOP LEVEL (GameRoute) */}
                      <Route path="/games" element={
                        <GameRoute>
                          <GamesPage />
                        </GameRoute>
                      } />

                      {/* Specific Game Routes - Can add :id param based routes if needed, ensuring they are Covered by GameRoute */}
                      {/* Note: In the original, specific games were hardcoded paths. Keeping them here but under GameRoute */}
                      <Route path="/games/proverb" element={<GameRoute><SoloGameProverb /></GameRoute>} />
                      <Route path="/games/kamel-elayah" element={<GameRoute><SoloGameVerse /></GameRoute>} />
                      <Route path="/games/who" element={<GameRoute><SoloGameWho /></GameRoute>} />
                      <Route path="/games/sobek_intel" element={<GameRoute><SoloGameSobek /></GameRoute>} />
                      <Route path="/games/mafia" element={<GameRoute><MafiaGame /></GameRoute>} />
                      <Route path="/games/matlha_law_adak" element={<GameRoute><CharadesGame /></GameRoute>} />
                      <Route path="/games/oul_besor3a" element={<GameRoute><PanicGame /></GameRoute>} />
                      <Route path="/games/mamno3at" element={<GameRoute><ForbiddenGame /></GameRoute>} />
                      <Route path="/games/hekaya_gama3eya" element={<GameRoute><StoryGame /></GameRoute>} />
                      {/* Dynamic Game Route for all other games */}
                      <Route path="/games/:id" element={<GameRoute><GamePlaceholder /></GameRoute>} />


                      <Route path="/login" element={<LoginPage />} />

                      {/* Admin Routes with Nested Layout */}
                      <Route path="/admin" element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }>
                        <Route index element={<AdminOverview />} />
                        <Route path="teams" element={<TeamsManager />} />
                        <Route path="teams/:id" element={<AdminTeamDetails />} />
                        <Route path="activity" element={<AdminActivity />} />
                        <Route path="users" element={<UsersManager />} />
                        <Route path="teams" element={<TeamsManager />} />
                        <Route path="games" element={<GamesManager />} />
                        <Route path="achievements" element={<AdminAchievements />} />
                        <Route path="transfers" element={<TransfersCenter />} />
                        <Route path="roles" element={<RolesManager />} />
                        <Route path="announcements" element={<AnnouncementsManager />} />
                        <Route path="flags" element={<FeatureFlagsManager />} />
                        <Route path="settings" element={<AdminSystemSettings />} />
                        <Route path="logs" element={<AuditLog />} />
                        <Route path="analytics" element={<AnalyticsDashboard />} />
                        <Route path="balancing" element={<GameBalancing />} />
                        <Route path="balancing" element={<GameBalancing />} />
                        <Route path="notifications" element={<PushNotifications />} />
                        <Route path="whatsapp" element={<WhatsAppManager />} />
                        <Route path="push-debug" element={<PushDebug />} />
                        <Route path="news" element={<NewsManager />} />
                        <Route path="prayers" element={<PrayersManager />} />
                        <Route path="prayers" element={<PrayersManager />} />
                        <Route path="media" element={<MediaManager />} />
                        <Route path="rooms" element={<RoomsManager />} />
                      </Route>

                      {/* Profile Selection (Intermediate Step) */}

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

                        {/* Moved Games out of here, but keeping link just in case of old links, redirect to /games */}
                        <Route path="games" element={<Navigate to="/games" replace />} />
                        <Route path="games/*" element={<Navigate to="/games" replace />} />

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
                        <Route path="informations" element={<InformationsPage />} />
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
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="team-chat" element={<TeamChatPage />} />
                        <Route path="achievements" element={<AchievementsPage />} />
                        <Route path="rankings" element={<RankingsPage />} />
                      </Route>

                      {/* Root Redirect */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Navigate to="/app/home" replace />
                        </ProtectedRoute>
                      } />

                      {/* Catch-all Redirect */}
                      <Route path="*" element={<Navigate to="/login" replace />} />

                    </Routes>
                  </Suspense>
                  <TeamChatPopup />
                  <TeamBroadcastListener />
                </NotificationProvider>
              </GameProvider>
            </AchievementsProvider>
          </AppProvider>
        </AuthProvider>
      </GlobalErrorBoundary>
    </Router>
  );
};

export default App;
