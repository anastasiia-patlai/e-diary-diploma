import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";

function Signup({ onClose, databaseName }) {
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
        category: "",
        teacherType: "", // ✅ ДОДАНО: тип викладача
        jobPosition: "",
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const addPositionField = () => {
        setFormData(prev => ({
            ...prev,
            positions: [...prev.positions, ""]
        }));
    };

    const removePositionField = (index) => {
        if (formData.positions.length > 1) {
            setFormData(prev => ({
                ...prev,
                positions: prev.positions.filter((_, i) => i !== index)
            }));
        }
    };

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
            case "teacherType": // ✅ ДОДАНО: валідація типу викладача
                if (formData.role === "teacher" && !value) {
                    error = "Оберіть тип викладача";
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

        if (!databaseName) {
            alert("Помилка: не вказано базу даних школи. Будь ласка, спочатку зареєструйте школу.");
            return;
        }

        Object.keys(formData).forEach((field) => {
            if (field === "positions") {
                validateField(field, formData[field]);
            } else {
                validateField(field, formData[field]);
            }
        });

        if (Object.values(errors).every((err) => !err)) {
            const filteredPositions = formData.role === "teacher"
                ? formData.positions.filter(pos => pos.trim() !== "")
                : [];

            // БАЗОВІ ДАНІ
            const submitData = {
                databaseName: databaseName,
                fullName: formData.fullName,
                role: formData.role,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                email: formData.email,
                password: formData.password
            };

            // ДОДАТКОВІ ПОЛЯ ЗА РОЛЛЮ
            if (formData.role === "student") {
                submitData.group = formData.group;
            } else if (formData.role === "teacher") {
                submitData.positions = filteredPositions;
                submitData.category = formData.category;
                submitData.teacherType = formData.teacherType;

                // Автоматично додаємо allowedCategories
                if (formData.teacherType === "young") {
                    submitData.allowedCategories = ["young"];
                } else if (formData.teacherType === "middle") {
                    submitData.allowedCategories = ["middle"];
                } else if (formData.teacherType === "senior") {
                    submitData.allowedCategories = ["senior"];
                } else if (formData.teacherType === "middle-senior") {
                    submitData.allowedCategories = ["middle", "senior"];
                } else if (formData.teacherType === "all") {
                    submitData.allowedCategories = ["young", "middle", "senior"];
                }
            } else if (formData.role === "admin") {
                submitData.jobPosition = formData.jobPosition;
            }

            // ВИДАЛИТИ teacherType ДЛЯ ВСІХ, КРІМ ВИКЛАДАЧІВ
            if (formData.role !== "teacher") {
                delete submitData.teacherType;
                delete submitData.allowedCategories;
            }

            console.log("Відправляємо дані:", submitData);

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
                        category: "",
                        teacherType: "", // ✅ Скидаємо тип викладача
                        jobPosition: "",
                    });
                    setTouched({});
                    setErrors({});
                    setTimeout(() => {
                        setSuccessMessage("");
                        if (onClose) onClose();
                    }, 2000);
                })
                .catch((err) => {
                    console.error("Детальна помилка реєстрації:", err);

                    if (err.response) {
                        console.error("Статус помилки:", err.response.status);
                        console.error("Дані помилки:", err.response.data);

                        // ДЕТАЛЬНЕ ВИВЕДЕННЯ ПОМИЛОК ВАЛІДАЦІЇ
                        if (err.response.data && err.response.data.details) {
                            const errorMessages = err.response.data.details
                                .map(detail => `${detail.field}: ${detail.message}`)
                                .join('\n');
                            alert(`Помилки валідації:\n${errorMessages}`);
                        } else if (err.response.data && err.response.data.error) {
                            alert("Помилка реєстрації: " + err.response.data.error);
                        } else {
                            alert("Сталася помилка під час реєстрації (код: " + err.response.status + ")");
                        }
                    } else if (err.request) {
                        console.error("Не вдалося отримати відповідь від сервера:", err.request);
                        alert("Не вдалося підключитися до сервера. Перевірте підключення до мережі.");
                    } else {
                        console.error("Помилка налаштування запиту:", err.message);
                        alert("Помилка при відправці запиту: " + err.message);
                    }
                });
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
                zIndex: 1000,
                padding: isMobile ? '10px' : '0',
                overflowY: 'auto'
            }}>
                <div style={{
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: isMobile ? '15px' : '20px',
                    width: isMobile ? '100%' : '600px',
                    maxHeight: isMobile ? '90vh' : '90vh',
                    overflowY: 'auto',
                    marginTop: isMobile ? '10px' : '0',
                    marginBottom: isMobile ? '10px' : '0',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: isMobile ? '10px' : '15px',
                            right: isMobile ? '10px' : '15px',
                            background: 'none',
                            border: 'none',
                            fontSize: isMobile ? '18px' : '20px',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '4px',
                            zIndex: 10
                        }}
                        aria-label="Закрити"
                    >
                        <FaTimes />
                    </button>

                    {successMessage && (
                        <div
                            style={{
                                backgroundColor: "#59b971",
                                color: "white",
                                padding: isMobile ? '8px 12px' : '10px 20px',
                                borderRadius: "8px",
                                textAlign: "center",
                                fontWeight: "bold",
                                marginBottom: '15px',
                                fontSize: isMobile ? '14px' : '16px'
                            }}
                        >
                            {successMessage}
                        </div>
                    )}

                    <h3 className="text-center mb-4" style={{
                        fontSize: isMobile ? '18px' : '20px',
                        paddingRight: isMobile ? '25px' : '0',
                        paddingTop: isMobile ? '7px' : '0',
                        wordWrap: 'break-word'
                    }}>
                        Реєстрація користувача
                    </h3>

                    <form onSubmit={handleSubmit} noValidate>
                        {/* ПІБ */}
                        <div className="mb-3">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '17px',
                                fontWeight: '500'
                            }}>
                                ПІБ
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                className={getInputClass("fullName")}
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Прізвище, Ім'я, По-батькові"
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px' : '12px'
                                }}
                            />
                            <div className="invalid-feedback" style={{
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                {errors.fullName}
                            </div>
                        </div>

                        {/* РОЛЬ */}
                        <div className="mb-3">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '17px',
                                fontWeight: '500'
                            }}>
                                Роль
                            </label>
                            <select
                                name="role"
                                className={getSelectClass("role")}
                                value={formData.role}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px' : '12px'
                                }}
                            >
                                <option value="">-- Оберіть роль --</option>
                                <option value="student">Студент / Учень</option>
                                <option value="parent">Батько / Мати</option>
                                <option value="teacher">Викладач</option>
                                <option value="admin">Адміністратор</option>
                            </select>
                            <div className="invalid-feedback" style={{
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                {errors.role}
                            </div>
                        </div>

                        {/* СТУДЕНТ */}
                        {formData.role === "student" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '15px' : '17px',
                                    fontWeight: '500'
                                }}>
                                    Група / Клас
                                </label>
                                <input
                                    type="text"
                                    name="group"
                                    className={getInputClass("group")}
                                    value={formData.group}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Напр. ПП-42"
                                    style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        padding: isMobile ? '10px' : '12px'
                                    }}
                                />
                                <div className="invalid-feedback" style={{
                                    fontSize: isMobile ? '12px' : '14px'
                                }}>
                                    {errors.group}
                                </div>
                            </div>
                        )}

                        {/* ВИКЛАДАЧ */}
                        {formData.role === "teacher" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '15px' : '17px',
                                    fontWeight: '500'
                                }}>
                                    Тип викладача *
                                </label>
                                <select
                                    name="teacherType"
                                    className={getSelectClass("teacherType")}
                                    value={formData.teacherType}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        padding: isMobile ? '10px' : '12px'
                                    }}
                                >
                                    <option value="">-- Оберіть тип --</option>
                                    <option value="young">Викладач молодших класів (1-4)</option>
                                    <option value="middle">Викладач середніх класів (5-9)</option>
                                    <option value="senior">Викладач старших класів (10-11)</option>
                                    <option value="middle-senior">Викладач середніх та старших класів</option>
                                    <option value="all">Викладач усіх класів</option>
                                </select>
                                <div className="invalid-feedback" style={{
                                    fontSize: isMobile ? '12px' : '14px'
                                }}>
                                    {errors.teacherType}
                                </div>

                                {/* Категорія кваліфікації */}
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '15px' : '17px',
                                    fontWeight: '500',
                                    marginTop: '15px'
                                }}>
                                    Категорія кваліфікації
                                </label>
                                <select
                                    name="category"
                                    className={getSelectClass("category")}
                                    value={formData.category}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        padding: isMobile ? '10px' : '12px'
                                    }}
                                >
                                    <option value="">-- Оберіть категорію --</option>
                                    <option value="Вища категорія">Вища категорія</option>
                                    <option value="Перша категорія">Перша категорія</option>
                                    <option value="Друга категорія">Друга категорія</option>
                                    <option value="Спеціаліст">Спеціаліст</option>
                                    <option value="Молодший спеціаліст">Молодший спеціаліст</option>
                                    <option value="Без категорії">Без категорії</option>
                                </select>
                                <div className="invalid-feedback" style={{
                                    fontSize: isMobile ? '12px' : '14px'
                                }}>
                                    {errors.category}
                                </div>

                                {/* Предмети */}
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '15px' : '17px',
                                    fontWeight: '500',
                                    marginTop: '15px'
                                }}>
                                    Предмети *
                                </label>
                                {formData.positions.map((position, index) => (
                                    <div key={index} className="d-flex align-items-center mb-2">
                                        <input
                                            type="text"
                                            className="form-control me-2"
                                            value={position}
                                            onChange={(e) => updatePosition(index, e.target.value)}
                                            onBlur={() => validateField("positions", formData.positions)}
                                            placeholder={`Предмет ${index + 1}`}
                                            style={{
                                                fontSize: isMobile ? '14px' : '16px',
                                                padding: isMobile ? '10px' : '12px'
                                            }}
                                        />
                                        {formData.positions.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => removePositionField(index)}
                                                style={{
                                                    padding: isMobile ? '8px' : '10px',
                                                    minWidth: '40px'
                                                }}
                                                aria-label="Видалити предмет"
                                            >
                                                <FaMinus size={isMobile ? 14 : 16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    style={{
                                        backgroundColor: 'rgba(105, 180, 185, 1)',
                                        color: 'white',
                                        border: '1px solid rgba(105, 180, 185, 1)',
                                        padding: isMobile ? '8px 12px' : '10px 15px',
                                        fontSize: isMobile ? '13px' : '14px',
                                        borderRadius: '6px',
                                        width: '100%',
                                        marginTop: '8px'
                                    }}
                                    className="btn"
                                    onClick={addPositionField}
                                >
                                    <FaPlus className="me-1" />
                                    Додати ще предмет
                                </button>
                                {errors.positions && (
                                    <div className="invalid-feedback d-block" style={{
                                        fontSize: isMobile ? '12px' : '14px'
                                    }}>
                                        {errors.positions}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* АДМІНІСТРАТОР - ПОСАДА */}
                        {formData.role === "admin" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '15px' : '17px',
                                    fontWeight: '500'
                                }}>
                                    Посада
                                </label>
                                <input
                                    type="text"
                                    name="jobPosition"
                                    className={getInputClass("jobPosition")}
                                    value={formData.jobPosition}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Напр. Заступник директора"
                                    style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        padding: isMobile ? '10px' : '12px'
                                    }}
                                />
                                <div className="invalid-feedback" style={{
                                    fontSize: isMobile ? '12px' : '14px'
                                }}>
                                    {errors.jobPosition}
                                </div>
                            </div>
                        )}

                        {/* ТЕЛЕФОН */}
                        <div className="mb-3">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '17px',
                                fontWeight: '500'
                            }}>
                                Телефон
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className={getInputClass("phone")}
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="+380..."
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px' : '12px'
                                }}
                            />
                            <div className="invalid-feedback" style={{
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                {errors.phone}
                            </div>
                        </div>

                        {/* ДАТА НАРОДЖЕННЯ */}
                        <div className="mb-3">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '17px',
                                fontWeight: '500'
                            }}>
                                Дата народження
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                className={getInputClass("dateOfBirth")}
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px' : '12px'
                                }}
                            />
                            <div className="invalid-feedback" style={{
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                {errors.dateOfBirth}
                            </div>
                        </div>

                        {/* ПОШТА */}
                        <div className="mb-3">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '17px',
                                fontWeight: '500'
                            }}>
                                Електронна пошта
                            </label>
                            <input
                                type="email"
                                name="email"
                                className={getInputClass("email")}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px' : '12px'
                                }}
                            />
                            <div className="invalid-feedback" style={{
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                {errors.email}
                            </div>
                        </div>

                        {/* ПАРОЛЬ */}
                        <div className="mb-3">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '17px',
                                fontWeight: '500'
                            }}>
                                Пароль
                            </label>
                            <input
                                type="password"
                                name="password"
                                className={getInputClass("password")}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px' : '12px'
                                }}
                            />
                            <div className="invalid-feedback" style={{
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                {errors.password}
                            </div>
                        </div>

                        {/* КНОПКА РЕЄСТРАЦІЇ */}
                        <button
                            type="submit"
                            className="btn w-100"
                            style={{
                                backgroundColor: "rgba(105, 180, 185, 1)",
                                color: "white",
                                border: "none",
                                padding: isMobile ? '12px' : '14px',
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: isMobile ? '16px' : '18px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Зареєструвати
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return null;
}

export default Signup;