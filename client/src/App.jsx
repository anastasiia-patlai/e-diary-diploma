import { BrowserRouter as Router, Routes, Route, Navigate as RouterNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Signup from "./pages/admins/Signup";
import Login from "./Login";
import Navigate from "./pages/Navigate";
import WelcomePage from "./WelcomePage";
import AdminPage from "./pages/admins/AdminPage";
import TeacherPage from "./pages/teachers/TeacherPage";
import StudentPage from "./pages/students/StudentPage";
import ParentPage from "./pages/parents/ParentPage";
import LanguageSwitcher from "./i18n/components/LanguageSwitcher";

function App() {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error(t("errors.readUser"), err);
    localStorage.removeItem("user");
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <Router>
      <div style={{
        position: 'fixed',
        top: '20px',
        right: isMobile ? '80px' : '100px',
        zIndex: 1000
      }}>
        <LanguageSwitcher onLogout={handleLogout} />
      </div>

      <Routes>
        <Route
          path="/"
          element={<RouterNavigate to="/welcome" replace />} />

        <Route
          path="/welcome"
          element={<WelcomePage />} />

        <Route
          path="/login"
          element={user ? <RouterNavigate to={`/${user.role}`} /> : <Login />}
        />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/student"
          element={
            user?.role === "student" ? (
              <StudentPage role="student" onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <RouterNavigate to="/login" />
            )
          }
        />

        <Route
          path="/teacher"
          element={
            user?.role === "teacher" ? (
              <TeacherPage role="teacher" onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <RouterNavigate to="/login" />
            )
          }
        />

        <Route
          path="/parent"
          element={
            user?.role === "parent" ? (
              <ParentPage role="parent" onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <RouterNavigate to="/login" />
            )
          }
        />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminPage onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <RouterNavigate to="/login" />
            )
          }
        />

        <Route path="*" element={<RouterNavigate to="/welcome" />} />
      </Routes>
    </Router>
  );
}

export default App;