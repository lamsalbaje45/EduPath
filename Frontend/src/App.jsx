import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Navbar from "./pages/navbar";
import Register from "./pages/register";
import Profile from "./pages/profile";
import Colleges from "./pages/colleges";
import CollegeDetail from "./pages/collegeDetail";
import { PlaceholderPage } from "./pages/placeholder";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { pathname } = useLocation();
  const hideNavbar = pathname === "/login" || pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Browse routes */}
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/colleges/:id" element={<CollegeDetail />} />

        <Route
          path="/jobs"
          element={<PlaceholderPage title="Jobs & Internships" />}
        />
        <Route
          path="/jobs/:id"
          element={<PlaceholderPage title="Job Details" />}
        />

        <Route
          path="/online-classes"
          element={<PlaceholderPage title="Online Classes" />}
        />
        <Route
          path="/online-classes/:id"
          element={<PlaceholderPage title="Class Details" />}
        />

        {/* CV Maker */}
        <Route
          path="/cv-maker"
          element={<PlaceholderPage title="CV Maker" />}
        />

        {/* Frontend profile preview — intentionally available without sign-in. */}
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="My Applications" />
            </ProtectedRoute>
          }
        />

        {/* Admin/Partner routes */}
        <Route
          path="/list-college"
          element={<PlaceholderPage title="List Your College" />}
        />
        <Route
          path="/post-job"
          element={<PlaceholderPage title="Post a Job" />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
