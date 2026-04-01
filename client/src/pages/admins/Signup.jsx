import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";

const LOGIN_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+_[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+$/;

function Signup({ onClose, databaseName }) {
    const { t } = useTranslation();
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
        teacherType: "",
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
                if (!value.trim()) error = t("signup.errors.fullNameRequired");
                break;
            case "role":
                if (!value) error = t("signup.errors.roleRequired");
                break;
            case "phone":
                if (!/^\+380\d{9}$/.test(value)) error = t("signup.errors.phoneInvalid");
                break;
            case "dateOfBirth":
                if (!value) error = t("signup.errors.birthDateRequired");
                break;
            case "email":
                if (!value.trim()) error = t("signup.errors.loginRequired");
                else if (!LOGIN_REGEX.test(value)) error = t("signup.errors.loginInvalid");
                break;
            case "password":
                if (!value) error = t("signup.errors.passwordRequired");
                else if (value.length < 6) error = t("signup.errors.passwordMinLength");
                break;
            case "confirmPassword":
                if (!value) error = t("signup.errors.confirmPasswordRequired");
                else if (value !== formData.password) error = t("signup.errors.passwordMismatch");
                break;
            case "group":
                if (formData.role === "student" && !value.trim()) error = t("signup.errors.groupRequired");
                break;
            case "positions":
                if (formData.role === "teacher" && formData.positions.every(pos => !pos.trim())) {
                    error = t("signup.errors.subjectsRequired");
                }
                break;
            case "teacherType":
                if (formData.role === "teacher" && !value) {
                    error = t("signup.errors.teacherTypeRequired");
                }
                break;
            case "jobPosition":
                if (formData.role === "admin" && !value.trim()) error = t("signup.errors.jobPositionRequired");
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
            alert(t("signup.errors.noDatabase"));
            return;
        }

        Object.keys(formData).forEach((field) => {
            validateField(field, formData[field]);
        });

        if (Object.values(errors).every((err) => !err)) {
            const filteredPositions = formData.role === "teacher"
                ? formData.positions.filter(pos => pos.trim() !== "")
                : [];

            const submitData = {
                databaseName: databaseName,
                fullName: formData.fullName,
                role: formData.role,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                email: formData.email,
                password: formData.password
            };

            if (formData.role === "student") {
                submitData.group = formData.group;
            } else if (formData.role === "teacher") {
                submitData.positions = filteredPositions;
                submitData.category = formData.category;
                submitData.teacherType = formData.teacherType;

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

            if (formData.role !== "teacher") {
                delete submitData.teacherType;
                delete submitData.allowedCategories;
            }

            console.log("Відправляємо дані:", submitData);

            axios.post("http://localhost:3001/api/signup", submitData)
                .then((res) => {
                    setSuccessMessage(t("signup.successMessage", { name: formData.fullName }));
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
                        teacherType: "",
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

                        if (err.response.data && err.response.data.details) {
                            const errorMessages = err.response.data.details
                                .map(detail => `${detail.field}: ${detail.message}`)
                                .join('\n');
                            alert(`${t("signup.errors.validationErrors")}\n${errorMessages}`);
                        } else if (err.response.data && err.response.data.error) {
                            alert(t("signup.errors.registrationError") + " " + err.response.data.error);
                        } else {
                            alert(t("signup.errors.serverError", { code: err.response.status }));
                        }
                    } else if (err.request) {
                        console.error("Не вдалося отримати відповідь від сервера:", err.request);
                        alert(t("signup.errors.connectionError"));
                    } else {
                        console.error("Помилка налаштування запиту:", err.message);
                        alert(t("signup.errors.requestError", { message: err.message }));
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
                        aria-label={t("signup.close")}
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
                        {t("signup.title")}
                    </h3>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                {t("signup.fullName")}
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                className={getInputClass("fullName")}
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={t("signup.fullNamePlaceholder")}
                                style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                            />
                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {errors.fullName}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                {t("signup.role")}
                            </label>
                            <select
                                name="role"
                                className={getSelectClass("role")}
                                value={formData.role}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                            >
                                <option value="">{t("signup.selectRole")}</option>
                                <option value="student">{t("signup.student")}</option>
                                <option value="parent">{t("signup.parent")}</option>
                                <option value="teacher">{t("signup.teacher")}</option>
                                <option value="admin">{t("signup.admin")}</option>
                            </select>
                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {errors.role}
                            </div>
                        </div>

                        {formData.role === "student" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                    {t("signup.group")}
                                </label>
                                <input
                                    type="text"
                                    name="group"
                                    className={getInputClass("group")}
                                    value={formData.group}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={t("signup.groupPlaceholder")}
                                    style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                                />
                                <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                    {errors.group}
                                </div>
                            </div>
                        )}

                        {formData.role === "teacher" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                    {t("signup.teacherType")} *
                                </label>
                                <select
                                    name="teacherType"
                                    className={getSelectClass("teacherType")}
                                    value={formData.teacherType}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                                >
                                    <option value="">{t("signup.selectTeacherType")}</option>
                                    <option value="young">{t("signup.teacherTypeYoung")}</option>
                                    <option value="middle">{t("signup.teacherTypeMiddle")}</option>
                                    <option value="senior">{t("signup.teacherTypeSenior")}</option>
                                    <option value="middle-senior">{t("signup.teacherTypeMiddleSenior")}</option>
                                    <option value="all">{t("signup.teacherTypeAll")}</option>
                                </select>
                                <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                    {errors.teacherType}
                                </div>

                                <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500', marginTop: '15px' }}>
                                    {t("signup.qualificationCategory")}
                                </label>
                                <select
                                    name="category"
                                    className={getSelectClass("category")}
                                    value={formData.category}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                                >
                                    <option value="">{t("signup.selectCategory")}</option>
                                    <option value="Вища категорія">{t("signup.categoryHighest")}</option>
                                    <option value="Перша категорія">{t("signup.categoryFirst")}</option>
                                    <option value="Друга категорія">{t("signup.categorySecond")}</option>
                                    <option value="Спеціаліст">{t("signup.categorySpecialist")}</option>
                                    <option value="Молодший спеціаліст">{t("signup.categoryJuniorSpecialist")}</option>
                                    <option value="Без категорії">{t("signup.categoryNoCategory")}</option>
                                </select>

                                <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500', marginTop: '15px' }}>
                                    {t("signup.subjects")} *
                                </label>
                                {formData.positions.map((position, index) => (
                                    <div key={index} className="d-flex align-items-center mb-2">
                                        <input
                                            type="text"
                                            className="form-control me-2"
                                            value={position}
                                            onChange={(e) => updatePosition(index, e.target.value)}
                                            onBlur={() => validateField("positions", formData.positions)}
                                            placeholder={t("signup.subjectPlaceholder", { number: index + 1 })}
                                            style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                                        />
                                        {formData.positions.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => removePositionField(index)}
                                                style={{ padding: isMobile ? '8px' : '10px', minWidth: '40px' }}
                                                aria-label={t("signup.removeSubject")}
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
                                    {t("signup.addSubject")}
                                </button>
                                {errors.positions && (
                                    <div className="invalid-feedback d-block" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                        {errors.positions}
                                    </div>
                                )}
                            </div>
                        )}

                        {formData.role === "admin" && (
                            <div className="mb-3 fade-in">
                                <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                    {t("signup.jobPosition")}
                                </label>
                                <input
                                    type="text"
                                    name="jobPosition"
                                    className={getInputClass("jobPosition")}
                                    value={formData.jobPosition}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={t("signup.jobPositionPlaceholder")}
                                    style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                                />
                                <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                    {errors.jobPosition}
                                </div>
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                {t("signup.phone")}
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className={getInputClass("phone")}
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={t("signup.phonePlaceholder")}
                                style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                            />
                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {errors.phone}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                {t("signup.birthDate")}
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                className={getInputClass("dateOfBirth")}
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                            />
                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {errors.dateOfBirth}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                {t("signup.login")}
                            </label>
                            <input
                                type="text"
                                name="email"
                                className={getInputClass("email")}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={t("signup.loginPlaceholder")}
                                style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                            />
                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {errors.email}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                {t("signup.password")}
                            </label>
                            <input
                                type="password"
                                name="password"
                                className={getInputClass("password")}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                            />
                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {errors.password}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500' }}>
                                {t("signup.confirmPassword")}
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className={getInputClass("confirmPassword")}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '10px' : '12px' }}
                            />
                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {errors.confirmPassword}
                            </div>
                        </div>

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
                            {t("signup.register")}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return null;
}

export default Signup;