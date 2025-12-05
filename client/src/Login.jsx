import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

function Login() {
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
            if (!value) error = "Електронна пошта обов'язкова";
            else if (!/\S+@\S+\.\S+/.test(value)) error = "Некоректна електронна адреса";
        }
        if (name === "password") {
            if (!value) error = "Пароль обов'язковий";
            else if (value.length < 6) error = "Пароль має містити щонайменше 6 символів";
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
            console.log("Відповідь сервера:", data);

            if (!res.ok) {
                alert(data.error || "Помилка входу");
                setLoading(false);
                return;
            }

            if (data.user && data.user.role) {
                // ЗБЕРІГАЄМО ВСІ ДАНІ В localStorage
                localStorage.setItem("user", JSON.stringify(data.user));

                // ДОДАЄМО ЗБЕРЕЖЕННЯ databaseName окремо для надійності
                localStorage.setItem("databaseName", data.user.databaseName);

                // Зберігаємо повну інформацію для профілю
                const userInfo = {
                    userId: data.user.id,
                    databaseName: data.user.databaseName,
                    fullName: data.user.fullName,
                    role: data.user.role,
                    email: data.user.email,
                    phone: data.user.phone,
                    position: data.user.position || (data.user.role === 'admin' ? 'Адміністратор' : data.user.role),
                    positions: data.user.positions || [],
                    schoolName: data.user.schoolName || 'Навчальний заклад'
                };

                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                console.log("✅ Всі дані збережено в localStorage:", {
                    user: data.user,
                    databaseName: data.user.databaseName,
                    userInfo: userInfo
                });

                // Перевіряємо, що дані збереглися
                const savedDbName = localStorage.getItem('databaseName');
                console.log("Перевірка збереження databaseName:", savedDbName);

                // Перенаправлення на відповідну сторінку
                window.location.href = `/${data.user.role}`;
            } else {
                alert("Некоректна відповідь від сервера");
                setLoading(false);
            }

        } catch (err) {
            console.error(err);
            alert("Помилка сервера");
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
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center min-vh-100"
            style={backgroundStyle}
        >
            <div
                className="card shadow-lg border-0"
                style={{
                    width: isMobile ? '90%' : '750px',
                    maxWidth: isMobile ? '90%' : '750px',
                    minHeight: isMobile ? 'auto' : '350px',
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "15px",
                    margin: isMobile ? '0.5rem' : '0'
                }}
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
                                Вхід в систему
                            </h2>
                        </div>

                        <h3 style={{
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            color: '#333',
                            fontWeight: '500',
                            margin: 0,
                            paddingTop: '5px'
                        }}>
                            Електронний щоденник
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        {/* ПОШТА */}
                        <div className="mb-3">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '16px' : '20px',
                                fontWeight: '500'
                            }}>
                                <FaEnvelope className="me-2" />
                                Електронна пошта
                            </label>
                            <input
                                type="email"
                                name="email"
                                className={getInputClass("email")}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Введіть email"
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

                        {/* ПАРОЛЬ */}
                        <div className="mb-4">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '16px' : '20px',
                                fontWeight: '500'
                            }}>
                                <FaLock className="me-2" />
                                Пароль
                            </label>
                            <input
                                type="password"
                                name="password"
                                className={getInputClass("password")}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Введіть пароль"
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
                                    Вхід...
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt className="me-2" />
                                    Увійти
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