import { BrowserRouter as Router, Routes, Route, Navigate as RouterNavigate } from "react-router-dom";
import Signup from "./pages/admins/Signup";
import Login from "./Login";
import Navigate from "./pages/Navigate";
import WelcomePage from "./WelcomePage";
import AdminPage from "./pages/admins/AdminPage";

function App() {
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error("Помилка читання user з localStorage:", err);
    localStorage.removeItem("user");
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <Router>
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
              <Navigate role="student" onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <RouterNavigate to="/login" />
            )
          }
        />

        <Route
          path="/teacher"
          element={
            user?.role === "teacher" ? (
              <Navigate role="teacher" onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <RouterNavigate to="/login" />
            )
          }
        />

        <Route
          path="/parent"
          element={
            user?.role === "parent" ? (
              <Navigate role="parent" onLogout={handleLogout} userFullName={user.fullName} />
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