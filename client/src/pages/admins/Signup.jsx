import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";

function Signup({ onClose }) {
    const [formData, setFormData] = useState({
        fullName: "",
        role: "",
        phone: "",
        dateOfBirth: "",
        email: "",
        password: "",
        confirmPassword: "",
        group: "",
        positions: [""],
        jobPosition: "", // ДОДАТИ: посада для адміністраторів
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    // НОВЕ ПОЛЕ ДЛЯ ПРЕДМЕТУ
    const addPositionField = () => {
        setFormData(prev => ({
            ...prev,
            positions: [...prev.positions, ""]
        }));
    };

    // ВИДАЛИТИ ПОЛЕ ДЛЯ ПРЕДМЕТУ
    const removePositionField = (index) => {
        if (formData.positions.length > 1) {
            setFormData(prev => ({
                ...prev,
                positions: prev.positions.filter((_, i) => i !== index)
            }));
        }
    };

    // ОНОВИТИ ПРЕДМЕТ
    const updatePosition = (index, value) => {
        setFormData(prev => ({
            ...prev,
            positions: prev.positions.map((pos, i) => i === index ? value : pos)
        }));
    };

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
            case "positions":
                if (formData.role === "teacher" && formData.positions.every(pos => !pos.trim())) {
                    error = "Вкажіть хоча б один предмет";
                }
                break;
            case "jobPosition":
                if (formData.role === "admin" && !value.trim()) error = "Вкажіть посаду";
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

        Object.keys(formData).forEach((field) => {
            if (field === "positions") {
                validateField(field, formData[field]);
            } else {
                validateField(field, formData[field]);
            }
        });

        if (Object.values(errors).every((err) => !err)) {
            const filteredPositions = formData.positions.filter(pos => pos.trim() !== "");

            const submitData = {
                ...formData,
                positions: filteredPositions,
                position: filteredPositions.join(", ")
            };

            if (formData.role !== "admin") {
                delete submitData.jobPosition;
            }

            axios.post("http://localhost:3001/api/signup", submitData)
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
                        positions: [""],
                        jobPosition: "",
                    });
                    setTouched({});
                    setErrors({});
                    setTimeout(() => {
                        setSuccessMessage("");
                        if (onClose) onClose();
                    }, 2000);
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

    if (onClose) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '20px',
                    width: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    {/* ЗАКРИТИ*/}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        <FaTimes />
                    </button>

                    {/* УСПІШНЕ ДОДАННЯ КОРИСТУВАЧА */}
                    {successMessage && (
                        <div
                            style={{
                                backgroundColor: "#59b971",
                                color: "white",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                textAlign: "center",
                                fontWeight: "bold",
                                marginBottom: '20px'
                            }}
                        >
                            {successMessage}
                        </div>
                    )}

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
                                placeholder="Прізвище, Ім'я, По-батькові"
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

                        {/* ВИКЛАДАЧ - КІЛЬКА ПРЕДМЕТІВ */}
                        {formData.role === "teacher" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label">Предмети</label>
                                {formData.positions.map((position, index) => (
                                    <div key={index} className="input-group mb-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={position}
                                            onChange={(e) => updatePosition(index, e.target.value)}
                                            onBlur={() => validateField("positions", formData.positions)}
                                            placeholder={`Предмет ${index + 1} (напр. Математика)`}
                                        />
                                        {formData.positions.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => removePositionField(index)}
                                            >
                                                <FaMinus />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    style={{
                                        backgroundColor: 'rgba(85, 160, 165, 1)',
                                        color: 'white',
                                        border: '1px solid rgba(85, 160, 165, 1)'
                                    }}
                                    className="btn btn-sm"
                                    onClick={addPositionField}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = 'rgba(61, 117, 121, 1)';
                                        e.target.style.borderColor = 'rgba(61, 117, 121, 1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                        e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                    }}
                                >
                                    <FaPlus className="me-1" />
                                    Додати ще предмет
                                </button>
                                {errors.positions && (
                                    <div className="invalid-feedback d-block">{errors.positions}</div>
                                )}
                            </div>
                        )}

                        {/* АДМІНІСТРАТОР - ПОСАДА */}
                        {formData.role === "admin" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label">Посада</label>
                                <input
                                    type="text"
                                    name="jobPosition"
                                    className={getInputClass("jobPosition")}
                                    value={formData.jobPosition}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Напр. Заступник директора з навчальної роботи, тощо"
                                />
                                <div className="invalid-feedback">{errors.jobPosition}</div>
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

                        {/* КНОПКА */}
                        <button
                            type="submit"
                            className="btn w-100"
                            style={{
                                backgroundColor: "rgba(105, 180, 185, 1)",
                                color: "white",
                                transition: "background-color 0.3s ease",
                                border: "none",
                                padding: "10px",
                                borderRadius: "5px",
                                cursor: "pointer"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = "rgba(61, 117, 121, 1)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = "rgba(105, 180, 185, 1)";
                            }}
                        >
                            Зареєструвати
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}

export default Signup;