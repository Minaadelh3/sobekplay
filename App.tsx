import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyList from "./pages/MyList";
import TitleDetails from "./pages/TitleDetails";
import WatchPlayer from "./pages/WatchPlayer";
import TripAnthem from "./pages/TripAnthem";
import Program from "./pages/Program";
import CommunityPage from "./pages/CommunityPage";
import ShopPage from "./pages/ShopPage";
import NewsPage from "./pages/NewsPage";
import AboutPage from "./pages/AboutPage";
import PhotosPage from "./pages/PhotosPage";
import PrayersPage from "./pages/PrayersPage";
import RoomsPage from "./pages/RoomsPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import PolicyPage from "./pages/PolicyPage";
import { posters } from "./data/posters";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/my-list"
          element={
            <ProtectedRoute>
              <MyList posters={posters} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch/:id"
          element={
            <ProtectedRoute>
              <WatchPlayer posters={posters} />
            </ProtectedRoute>
          }
        />

        {/* Content Routes */}
        <Route path="/title/:id" element={<TitleDetails posters={posters} />} />
        <Route path="/movies" element={<Home />} />
        <Route path="/series" element={<Home />} />
        <Route path="/kids" element={<Home />} />
        <Route path="/prayers" element={<PrayersPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/she3ar-al-re7la" element={<TripAnthem />} />
        <Route path="/program" element={<Program />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/coming-soon" element={<Home />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/photos" element={<PhotosPage />} />
      </Route>
    </Routes>
  );
}