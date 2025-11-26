import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

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

        Object.keys(formData).forEach((field) =>
            validateField(field, formData[field])
        );

        if (Object.values(errors).some((err) => err)) return;

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
            }

        } catch (err) {
            console.error(err);
            alert("Помилка сервера");
        }
    };

    const getInputClass = (name) => {
        if (!touched[name]) return "form-control";
        if (errors[name]) return "form-control is-invalid";
        return "form-control is-valid";
    };

    return (
        <div
            className="d-flex justify-content-start align-items-center vh-100"
            style={{
                backgroundImage: "url('/images/background-login.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                paddingLeft: "350px",
            }}
        >
            <div
                className="card shadow-sm p-4"
                style={{
                    width: "700px",
                    minHeight: "300px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "15px",
                }}
            >
                <h3 className="text-center mb-4">Вхід до системи електронний щоденник</h3>

                <form onSubmit={handleSubmit} noValidate>
                    {/* ПОШТА */}
                    <div className="mb-3">
                        <label className="form-label">Електронна пошта</label>
                        <input
                            type="email"
                            name="email"
                            className={getInputClass("email")}
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Введіть email"
                        />
                        <div className="invalid-feedback">{errors.email}</div>
                    </div>

                    {/* ПАРОЛЬ */}
                    <div className="mb-4">
                        <label className="form-label">Пароль</label>
                        <input
                            type="password"
                            name="password"
                            className={getInputClass("password")}
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Введіть пароль"
                        />
                        <div className="invalid-feedback">{errors.password}</div>
                    </div>

                    <button
                        type="submit"
                        className="btn w-100"
                        style={{
                            backgroundColor: "rgba(105, 180, 185, 1)",
                            color: "white",
                            height: "50px",
                            fontSize: "1.2rem"
                        }}
                    >
                        Увійти
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;