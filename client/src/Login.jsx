import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "email":
                if (!value) {
                    error = "Електронна пошта обов'язкова";
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = "Некоректна електронна адреса";
                }
                break;

            case "password":
                if (!value) {
                    error = "Пароль обов'язковий";
                } else if (value.length < 6) {
                    error = "Пароль має містити щонайменше 6 символів";
                }
                break;

            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        Object.keys(formData).forEach((field) =>
            validateField(field, formData[field])
        );

        if (Object.values(errors).every((err) => !err)) {
            alert("Вхід успішний!");
            console.log("Дані форми:", formData);
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
                <h3 className="text-center mb-4">Вхід до  системи електронний щоденник</h3>

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
        </div >
    );
}

export default Login;
