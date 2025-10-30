import { BrowserRouter as Router, Routes, Route, Navigate as Redirect } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Navigate from "./pages/Navigate";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import ParentPage from "./pages/ParentPage";
import AdminPage from "./pages/AdminPage";

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
          element={
            user ? <Redirect to={`/${user.role}`} /> : <Redirect to="/login" />
          }
        />
        <Route
          path="/login"
          element={user ? <Redirect to={`/${user.role}`} /> : <Login />}
        />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/student"
          element={
            user?.role === "student" ? (
              <Navigate role="student" onLogout={handleLogout} userFullName={user.fullName} />) : (
              <Redirect to="/login" />
            )
          }
        />

        <Route
          path="/teacher"
          element={
            user?.role === "teacher" ? (
              <Navigate role="teacher" onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <Redirect to="/login" />
            )
          }
        />

        <Route
          path="/parent"
          element={
            user?.role === "parent" ? (
              <Navigate role="parent" onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <Redirect to="/login" />
            )
          }
        />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <Navigate role="admin" onLogout={handleLogout} userFullName={user.fullName} />
            ) : (
              <Redirect to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
