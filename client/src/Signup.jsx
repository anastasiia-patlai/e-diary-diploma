import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Signup() {
    const [formData, setFormData] = useState({
        fullName: "",
        role: "",
        phone: "",
        dateOfBirth: "",
        email: "",
        password: "",
        confirmPassword: "",
        group: "",
        position: "",
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "fullName":
                if (!value.trim()) error = "Введіть ПІБ";
                break;
            case "role":
                if (!value) error = "Оберіть роль";
                break;
            case "phone":
                if (!/^\+380\d{9}$/.test(value)) error = "Телефон у форматі +380XXXXXXXXX";
                break;
            case "dateOfBirth":
                if (!value) error = "Вкажіть дату народження";
                break;
            case "email":
                if (!/\S+@\S+\.\S+/.test(value)) error = "Некоректна електронна адреса";
                break;
            case "password":
                if (!value) error = "Пароль обов'язковий";
                else if (value.length < 6) error = "Пароль має містити щонайменше 6 символів";
                break;
            case "confirmPassword":
                if (!value) error = "Підтвердження пароля обов'язкове";
                else if (value !== formData.password) error = "Паролі не збігаються";
                break;
            case "group":
                if (formData.role === "student" && !value.trim()) error = "Вкажіть групу / клас";
                break;
            case "position":
                if (formData.role === "teacher" && !value.trim()) error = "Вкажіть предмет або посаду";
                break;
            default:
                break;
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

    const handleSubmit = (e) => {
        e.preventDefault();

        Object.keys(formData).forEach((field) => validateField(field, formData[field]));

        if (Object.values(errors).every((err) => !err)) {
            axios.post("http://localhost:3001/api/signup", formData)
                .then((res) => {
                    setSuccessMessage(`Користувач ${formData.fullName} доданий!`);
                    setFormData({
                        fullName: "",
                        role: "",
                        phone: "",
                        dateOfBirth: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        group: "",
                        position: "",
                    });
                    setTouched({});
                    setErrors({});
                    setTimeout(() => setSuccessMessage(""), 3000);
                })
                .catch((err) => console.error(err));
        }
    };

    const getInputClass = (name) => {
        if (!touched[name]) return "form-control";
        if (errors[name]) return "form-control is-invalid";
        return "form-control is-valid";
    };

    const getSelectClass = (name) => {
        if (!touched[name]) return "form-select";
        if (errors[name]) return "form-select is-invalid";
        return "form-select is-valid";
    };

    return (
        <div
            className="container d-flex justify-content-center align-items-center mt-5"
            style={{ minHeight: "80vh" }}
        >
            <div style={{ position: "relative", width: "600px" }}>
                {/* Повідомлення успіху */}
                {successMessage && (
                    <div
                        style={{
                            position: "absolute",
                            top: "-60px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "#59b971",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "10px",
                            zIndex: 1000,
                            textAlign: "center",
                            fontWeight: "bold",
                        }}
                    >
                        {successMessage}
                    </div>
                )}
                <div
                    className="card shadow-sm p-4"
                    style={{
                        width: "600px",
                        minHeight: "600px",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                    }}
                >
                    <h3 className="text-center mb-4">Реєстрація користувача</h3>

                    <form onSubmit={handleSubmit} noValidate>
                        {/* ПІБ */}
                        <div className="mb-3">
                            <label className="form-label">ПІБ</label>
                            <input
                                type="text"
                                name="fullName"
                                className={getInputClass("fullName")}
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Прізвище, Ім’я, По-батькові"
                            />
                            <div className="invalid-feedback">{errors.fullName}</div>
                        </div>

                        {/* РОЛЬ */}
                        <div className="mb-3">
                            <label className="form-label">Роль</label>
                            <select
                                name="role"
                                className={getSelectClass("role")}
                                value={formData.role}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            >
                                <option value="">-- Оберіть роль --</option>
                                <option value="student">Студент / Учень</option>
                                <option value="parent">Батько / Мати</option>
                                <option value="teacher">Викладач</option>
                                <option value="admin">Адміністратор</option>
                            </select>
                            <div className="invalid-feedback">{errors.role}</div>
                        </div>

                        {/* СТУДЕНТ */}
                        {formData.role === "student" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label">Група / Клас</label>
                                <input
                                    type="text"
                                    name="group"
                                    className={getInputClass("group")}
                                    value={formData.group}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Напр. ПП-42"
                                />
                                <div className="invalid-feedback">{errors.group}</div>
                            </div>
                        )}

                        {/* ВИКЛАДАЧ */}
                        {formData.role === "teacher" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label">Посада / Предмет</label>
                                <input
                                    type="text"
                                    name="position"
                                    className={getInputClass("position")}
                                    value={formData.position}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Напр. Математика"
                                />
                                <div className="invalid-feedback">{errors.position}</div>
                            </div>
                        )}

                        {/* ТЕЛЕФОН */}
                        <div className="mb-3">
                            <label className="form-label">Телефон</label>
                            <input
                                type="tel"
                                name="phone"
                                className={getInputClass("phone")}
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="+380..."
                            />
                            <div className="invalid-feedback">{errors.phone}</div>
                        </div>

                        {/* ДАТА НАРОДЖЕННЯ */}
                        <div className="mb-3">
                            <label className="form-label">Дата народження</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                className={getInputClass("dateOfBirth")}
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            <div className="invalid-feedback">{errors.dateOfBirth}</div>
                        </div>

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
                            />
                            <div className="invalid-feedback">{errors.email}</div>
                        </div>

                        {/* ПАРОЛЬ */}
                        <div className="mb-3">
                            <label className="form-label">Пароль</label>
                            <input
                                type="password"
                                name="password"
                                className={getInputClass("password")}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            <div className="invalid-feedback">{errors.password}</div>
                        </div>

                        {/* ПІДТВЕРДЖЕННЯ ПАРОЛЮ */}
                        <div className="mb-4">
                            <label className="form-label">Підтвердження пароля</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className={getInputClass("confirmPassword")}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            <div className="invalid-feedback">{errors.confirmPassword}</div>
                        </div>

                        {/* КНОПКА */}
                        <button
                            type="submit"
                            className="btn w-100"
                            style={{ backgroundColor: "#59b971", color: "white" }}
                        >
                            Зареєструватися
                        </button>
                    </form>
                </div>

                <style>
                    {`
                      .fade-in {
                        animation: fadeIn 0.4s ease;
                      }
                                
                      @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    `}
                </style>
            </div>
        </div>
    );
}
export default Signup;
