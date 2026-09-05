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
import Jobs from "./pages/jobs";
import JobDetail from "./pages/jobDetail";
import OnlineClasses from "./pages/onlineClasses";
import OnlineClassDetail from "./pages/onlineClassDetail";
import CvMaker from "./pages/cvMaker";
import ListCollege from "./pages/listCollege";
import PostJob from "./pages/postJob";
import Applications from "./pages/applications";
import NotFound from "./pages/notFound";
import Unauthorized from "./pages/unauthorized";
import EmployerDashboard from "./pages/employerDashboard";
import AdminDashboard from "./pages/adminDashboard";
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
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Browse routes */}
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/colleges/:id" element={<CollegeDetail />} />

        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        <Route path="/online-classes" element={<OnlineClasses />} />
        <Route path="/online-classes/:id" element={<OnlineClassDetail />} />

        {/* CV Maker - Gated behind ProtectedRoute */}
        <Route
          path="/cv-maker"
          element={
            <ProtectedRoute>
              <CvMaker />
            </ProtectedRoute>
          }
        />

        {/* Protected Profile & Applications */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />

        {/* Role-Gated Dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin/Partner submission routes */}
        <Route
          path="/list-college"
          element={
            <ProtectedRoute>
              <ListCollege />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute>
              <PostJob />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
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
