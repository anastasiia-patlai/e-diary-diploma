import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import LanguageSwitcher from "./i18n/components/LanguageSwitcher";


function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);

    // Відслідковуємо зміну розміру вікна
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const validateField = (name, value) => {
        let error = "";
        if (name === "email") {
            if (!value) error = t("login.errors.emailRequired");
            else if (!/\S+@\S+\.\S+/.test(value)) error = t("login.errors.emailInvalid");
        }
        if (name === "password") {
            if (!value) error = t("login.errors.passwordRequired");
            else if (value.length < 6) error = t("login.errors.passwordMinLength");
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (touched[name]) validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        Object.keys(formData).forEach((field) =>
            validateField(field, formData[field])
        );

        if (Object.values(errors).some((err) => err)) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:3001/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            console.log(t("login.logs.serverResponse"), data);

            if (!res.ok) {
                alert(data.error || t("login.errors.loginError"));
                setLoading(false);
                return;
            }

            if (data.user && data.user.role) {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("databaseName", data.user.databaseName);

                const userInfo = {
                    userId: data.user.id,
                    databaseName: data.user.databaseName,
                    fullName: data.user.fullName,
                    role: data.user.role,
                    email: data.user.email,
                    phone: data.user.phone,
                    position: data.user.position || (data.user.role === 'admin' ? t("login.defaults.admin") : data.user.role),
                    positions: data.user.positions || [],
                    schoolName: data.user.schoolName || t("login.defaults.schoolName")
                };

                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                console.log(t("login.logs.dataSaved"), {
                    user: data.user,
                    databaseName: data.user.databaseName,
                    userInfo: userInfo
                });

                const savedDbName = localStorage.getItem('databaseName');
                console.log(t("login.logs.checkDatabaseName"), savedDbName);

                window.location.href = `/${data.user.role}`;
            } else {
                alert(t("login.errors.invalidResponse"));
                setLoading(false);
            }

        } catch (err) {
            console.error(err);
            alert(t("login.errors.serverError"));
            setLoading(false);
        }
    };

    const getInputClass = (name) => {
        if (!touched[name]) return "form-control";
        if (errors[name]) return "form-control is-invalid";
        return "form-control is-valid";
    };

    const backgroundStyle = {
        backgroundImage: "url('/images/background-login.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        position: "relative"
    };

    // Стиль для контейнера перемикача мови - ТІЛЬКИ ПОЗИЦІОНУВАННЯ, БЕЗ ФОНУ!
    const languageSwitcherStyle = {
        position: 'fixed',
        top: '18px',
        right: isMobile ? '16px' : '100px',
        zIndex: 999
    };

    const cardStyle = {
        width: isMobile ? '90%' : '750px',
        maxWidth: isMobile ? '90%' : '750px',
        minHeight: isMobile ? 'auto' : '350px',
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "15px",
        margin: isMobile ? '0.5rem' : '0',
        position: 'relative',
        zIndex: 1000
    };

    const handleLogout = () => { };

    return (
        <div
            className="d-flex justify-content-center align-items-center min-vh-100"
            style={backgroundStyle}
        >
            <div style={languageSwitcherStyle}>
                <LanguageSwitcher onLogout={handleLogout} isLoginPage={true} />
            </div>

            <div
                className="card shadow-lg border-0"
                style={cardStyle}
            >
                <div className="card-body p-4 p-md-5">
                    <div className="text-center mb-4">
                        <div className="d-flex justify-content-center align-items-center mb-3">
                            <FaSignInAlt style={{
                                fontSize: isMobile ? '2rem' : '2.5rem',
                                color: 'rgba(105, 180, 185, 1)',
                                marginRight: '15px'
                            }} />
                            <h2 style={{
                                fontSize: isMobile ? '1.5rem' : '1.7rem',
                                color: 'rgba(105, 180, 185, 1)',
                                fontWeight: '700',
                                margin: 0
                            }}>
                                {t("login.title")}
                            </h2>
                        </div>

                        <h3 style={{
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            color: '#333',
                            fontWeight: '500',
                            margin: 0,
                            paddingTop: '5px'
                        }}>
                            {t("login.subtitle")}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-3">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '16px' : '20px',
                                fontWeight: '500'
                            }}>
                                <FaEnvelope className="me-2" />
                                {t("login.emailLabel")}
                            </label>
                            <input
                                type="email"
                                name="email"
                                className={getInputClass("email")}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={t("login.emailPlaceholder")}
                                style={{
                                    fontSize: isMobile ? '16px' : '20px',
                                    padding: isMobile ? '12px 15px' : '14px 18px',
                                    height: isMobile ? '50px' : '55px'
                                }}
                                size={isMobile ? "lg" : undefined}
                            />
                            <div className="invalid-feedback" style={{
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                {errors.email}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '16px' : '20px',
                                fontWeight: '500'
                            }}>
                                <FaLock className="me-2" />
                                {t("login.passwordLabel")}
                            </label>
                            <input
                                type="password"
                                name="password"
                                className={getInputClass("password")}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={t("login.passwordPlaceholder")}
                                style={{
                                    fontSize: isMobile ? '16px' : '20px',
                                    padding: isMobile ? '12px 15px' : '14px 18px',
                                    height: isMobile ? '50px' : '55px'
                                }}
                                size={isMobile ? "lg" : undefined}
                            />
                            <div className="invalid-feedback" style={{
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                {errors.password}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn w-100 d-flex justify-content-center align-items-center"
                            disabled={loading}
                            style={{
                                backgroundColor: "rgba(105, 180, 185, 1)",
                                color: "white",
                                height: isMobile ? '50px' : '60px',
                                fontSize: isMobile ? '1.1rem' : '1.4rem',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                padding: isMobile ? '10px' : '12px'
                            }}
                            onMouseOver={(e) => {
                                if (!loading) e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                            }}
                            onMouseOut={(e) => {
                                if (!loading) e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {t("login.loggingIn")}
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt className="me-2" />
                                    {t("login.loginButton")}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;