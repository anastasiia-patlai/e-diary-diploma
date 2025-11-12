import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import {
    FaSchool,
    FaUser,
    FaLock,
    FaCity,
    FaHashtag,
    FaDatabase,
    FaMapMarkerAlt,
    FaUserTie,
    FaEnvelope,
    FaPhone
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WelcomePage = () => {
    const [formData, setFormData] = useState({
        institutionType: 'school',
        number: '',
        name: '',
        honoraryName: '',
        city: '',
        address: '',
        adminFullName: '',
        adminPosition: '',
        adminEmail: '',
        adminPhone: '',
        adminPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [databaseName, setDatabaseName] = useState('');
    const [institutionFullName, setInstitutionFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState('');
    const [hasSchool, setHasSchool] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:3001/api';

    const institutionTypes = [
        { value: 'school', label: 'Школа' },
        { value: 'gymnasium', label: 'Гімназія' },
        { value: 'lyceum', label: 'Ліцей' },
        { value: 'college', label: 'Коледж' },
        { value: 'university', label: 'Університет' }
    ];

    const backgroundStyle = {
        backgroundImage: "url('/images/background-start.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh"
    };

    useEffect(() => {
        const checkSchoolExists = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/school/check-school`);
                setHasSchool(response.data.hasSchool);
                if (response.data.hasSchool) {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error checking school:', error);
                if (error.response?.status === 404) {
                    setHasSchool(false);
                } else {
                    setError('Помилка при перевірці наявності навчального закладу');
                }
            } finally {
                setChecking(false);
            }
        };

        checkSchoolExists();
    }, [navigate]);

    // ГЕНЕРУВАННЯ НАЗВИ БАЗИ ДАНИХ ТА ПОВНОЇ НАЗВИ ЗАКЛАДУ
    useEffect(() => {
        const { institutionType, number, name, honoraryName, city } = formData;

        if (institutionType && city) {
            const fullName = generateInstitutionFullName(institutionType, number, name, honoraryName);
            setInstitutionFullName(fullName);

            const dbName = generateDatabaseName(institutionType, number, name, honoraryName, city);
            setDatabaseName(dbName);
        } else {
            setInstitutionFullName('');
            setDatabaseName('');
        }
    }, [formData.institutionType, formData.number, formData.name, formData.honoraryName, formData.city]);

    // ВАЛІДАЦІЯ ПОЛІВ
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'institutionType':
                if (!value) error = 'Тип закладу обов\'язковий';
                break;
            case 'number':
                if (['school', 'gymnasium', 'lyceum'].includes(formData.institutionType)) {
                    if (!value) error = 'Номер закладу обов\'язковий';
                    else if (!value.trim()) error = 'Номер закладу не може бути пустим';
                }
                break;
            case 'name':
                if (['gymnasium', 'lyceum', 'college', 'university'].includes(formData.institutionType)) {
                    if (!value) error = 'Назва закладу обов\'язкова';
                    else if (!value.trim()) error = 'Назва закладу не може бути пустою';
                }
                break;
            case 'honoraryName':
                if (['college', 'university'].includes(formData.institutionType)) {
                    if (!value) error = 'Імені обов\'язкове для коледжу та університету';
                    else if (!value.trim()) error = 'Імені не може бути пустим';
                }
                break;
            case 'city':
                if (!value) error = 'Місто обов\'язкове';
                else if (!value.trim()) error = 'Місто не може бути пустим';
                break;
            case 'address':
                if (!value) error = 'Адреса обов\'язкова';
                else if (!value.trim()) error = 'Адреса не може бути пустою';
                break;
            case 'adminFullName':
                if (!value) error = 'ПІБ адміністратора обов\'язковий';
                else if (!value.trim()) error = 'ПІБ адміністратора не може бути пустим';
                break;
            case 'adminPosition':
                if (!value) error = 'Посада обов\'язкова';
                else if (!value.trim()) error = 'Посада не може бути пустою';
                break;
            case 'adminEmail':
                if (!value) error = 'Електронна пошта обов\'язкова';
                else if (!/\S+@\S+\.\S+/.test(value)) error = 'Некоректна електронна адреса';
                break;
            case 'adminPhone':
                if (!value) error = 'Номер телефону обов\'язковий';
                else if (!/^\+380\d{9}$/.test(value.replace(/\s/g, ''))) error = 'Некоректний номер телефону. Формат: +380XXXXXXXXX';
                break;
            case 'adminPassword':
                if (!value) error = 'Пароль обов\'язковий';
                else if (value.length < 6) error = 'Пароль має містити щонайменше 6 символів';
                break;
            case 'confirmPassword':
                if (!value) error = 'Підтвердження пароля обов\'язкове';
                else if (value !== formData.adminPassword) error = 'Паролі не співпадають';
                break;
            default:
                error = '';
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'adminPhone') {
            let formattedValue = value.replace(/\D/g, '');
            if (formattedValue.startsWith('380')) {
                formattedValue = '+' + formattedValue;
            } else if (formattedValue.startsWith('80')) {
                formattedValue = '+3' + formattedValue;
            } else if (formattedValue.startsWith('0')) {
                formattedValue = '+38' + formattedValue;
            }

            if (formattedValue.length > 13) {
                formattedValue = formattedValue.substring(0, 13);
            }

            setFormData((prev) => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (touched[name]) validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const getInputClass = (name) => {
        if (!touched[name]) return "form-control";
        if (errors[name]) return "form-control is-invalid";
        return "form-control is-valid";
    };

    const generateInstitutionFullName = (type, number, name, honoraryName) => {
        const typeNames = {
            school: 'Школа',
            gymnasium: 'Гімназія',
            lyceum: 'Ліцей',
            college: 'Коледж',
            university: 'Університет'
        };

        let fullName = typeNames[type];

        if (number && ['school', 'gymnasium', 'lyceum'].includes(type)) {
            fullName += ` №${number}`;
        }

        if (name && ['gymnasium', 'lyceum', 'college', 'university'].includes(type)) {
            fullName += ` ${name}`;
        }

        if (honoraryName && ['college', 'university'].includes(type)) {
            fullName += ` імені ${honoraryName}`;
        } else if (honoraryName && ['gymnasium', 'lyceum'].includes(type)) {
            fullName += ` імені ${honoraryName}`;
        }

        return fullName;
    };

    // ДЛЯ ГЕНЕРАЦІЇ НАЗВИ БАЗИ ДАНИХ
    function generateDatabaseName(institutionType, number, name, honoraryName, city) {
        const typePrefix = {
            school: 'school',
            gymnasium: 'gymnasium',
            lyceum: 'lyceum',
            college: 'college',
            university: 'university'
        };

        const transliterate = (text) => {
            const ukrainianToLatin = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g',
                'д': 'd', 'е': 'e', 'є': 'ie', 'ж': 'zh', 'з': 'z',
                'и': 'y', 'і': 'i', 'ї': 'i', 'й': 'i', 'к': 'k',
                'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
                'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
                'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
                'ь': '', 'ю': 'iu', 'я': 'ia',
                'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G',
                'Д': 'D', 'Е': 'E', 'Є': 'Ie', 'Ж': 'Zh', 'З': 'Z',
                'И': 'Y', 'І': 'I', 'Ї': 'I', 'Й': 'I', 'К': 'K',
                'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
                'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
                'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
                'Ь': '', 'Ю': 'Iu', 'Я': 'Ia',
                "'": '', '"': '', '`': '', '~': '', '!': '', '@': '',
                '#': '', '$': '', '%': '', '^': '', '&': '', '*': '',
                '(': '', ')': '', '=': '', '+': '', '[': '', ']': '',
                '{': '', '}': '', '|': '', '\\': '', '/': '', ':': '',
                ';': '', '<': '', '>': '', ',': '', '.': '', '?': ''
            };

            return text
                .split('')
                .map(char => ukrainianToLatin[char] || char)
                .join('')
                .replace(/\s+/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
        };

        const cleanCity = transliterate(city).toLowerCase();
        let dbName = `${typePrefix[institutionType]}_${cleanCity}`;

        if (number) {
            const cleanNumber = number.toString().replace(/\s+/g, '');
            dbName += `_${cleanNumber}`;
        }

        if (name) {
            const cleanName = transliterate(name).toLowerCase();
            if (cleanName) {
                dbName += `_${cleanName}`;
            }
        }

        if (honoraryName) {
            const cleanHonorary = transliterate(honoraryName).toLowerCase();
            if (cleanHonorary) {
                dbName += `_${cleanHonorary}`;
            }
        }

        return dbName.slice(0, 50) + '_' + Date.now().toString().slice(-6);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        Object.keys(formData).forEach((field) => {
            setTouched((prev) => ({ ...prev, [field]: true }));
            validateField(field, formData[field]);
        });

        if (Object.values(errors).some((err) => err)) {
            setError('Будь ласка, виправте помилки в формі');
            return;
        }

        if (['school', 'gymnasium', 'lyceum'].includes(formData.institutionType) && !formData.number) {
            setError('Для обраного типу закладу номер є обов\'язковим');
            return;
        }

        if (['college', 'university'].includes(formData.institutionType) && !formData.honoraryName) {
            setError('Для коледжу та університету імені є обов\'язковим');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/school/register`, formData);

            navigate('/login', {
                state: {
                    message: 'Навчальний заклад успішно зареєстровано! Тепер увійдіть в систему.'
                }
            });

        } catch (error) {
            console.error('Error registering school:', error);
            setError(error.response?.data?.message || 'Помилка при реєстрації навчального закладу');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={backgroundStyle}>
                <div className="text-center">
                    <Spinner animation="border" style={{ color: 'rgba(105, 180, 185, 1)' }} />
                    <p className="mt-3">Перевірка наявності навчального закладу...</p>
                </div>
            </Container>
        );
    }

    if (hasSchool) {
        return null;
    }

    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center py-4" style={backgroundStyle}>
            <div style={{ width: '785px', maxWidth: '100%' }}>
                <Card className="shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <Card.Header className="text-white text-center py-4" style={{ backgroundColor: 'rgba(105, 180, 185, 1)' }}>
                        <FaSchool size={48} className="mb-3" />
                        <h2 className="mb-0">Реєстрація навчального закладу</h2>
                        <p className="mb-0 mt-2 opacity-75">
                            Заповніть інформацію про ваш навчальний заклад
                        </p>
                    </Card.Header>
                    <Card.Body className="p-4">
                        {error && (
                            <Alert variant="danger" className="mb-4">
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit} noValidate>
                            <div className="mb-4">
                                <h5 className="mb-3" style={{ color: 'rgba(105, 180, 185, 1)' }}>
                                    <FaSchool className="me-2" />
                                    Інформація про навчальний заклад
                                </h5>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Тип закладу *</Form.Label>
                                            <Form.Select
                                                name="institutionType"
                                                className={getInputClass("institutionType")}
                                                value={formData.institutionType}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                            >
                                                {institutionTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <div className="invalid-feedback">{errors.institutionType}</div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        {['school', 'gymnasium', 'lyceum'].includes(formData.institutionType) && (
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    <FaHashtag className="me-2" />
                                                    Номер закладу *
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="number"
                                                    className={getInputClass("number")}
                                                    value={formData.number}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Наприклад: 1"
                                                    required
                                                />
                                                <div className="invalid-feedback">{errors.number}</div>
                                            </Form.Group>
                                        )}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        {['gymnasium', 'lyceum', 'college', 'university'].includes(formData.institutionType) && (
                                            <Form.Group className="mb-3">
                                                <Form.Label>Назва закладу *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    className={getInputClass("name")}
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Наприклад: спеціалізована"
                                                    required
                                                />
                                                <div className="invalid-feedback">{errors.name}</div>
                                            </Form.Group>
                                        )}
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Імені {['college', 'university'].includes(formData.institutionType) && '*'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="honoraryName"
                                                className={getInputClass("honoraryName")}
                                                value={formData.honoraryName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Наприклад: Тараса Шевченка"
                                                required={['college', 'university'].includes(formData.institutionType)}
                                            />
                                            <div className="invalid-feedback">{errors.honoraryName}</div>
                                            <Form.Text className="text-muted">
                                                {['college', 'university'].includes(formData.institutionType)
                                                    ? 'Обов\'язкове поле для коледжу та університету'
                                                    : 'Необов\'язкове поле для школи, гімназії та ліцею'
                                                }
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaCity className="me-2" />
                                                Місто *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                className={getInputClass("city")}
                                                value={formData.city}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Наприклад: Київ"
                                                required
                                            />
                                            <div className="invalid-feedback">{errors.city}</div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaMapMarkerAlt className="me-2" />
                                                Адреса *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                className={getInputClass("address")}
                                                value={formData.address}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Наприклад: вул. Шевченка, 1"
                                                required
                                            />
                                            <div className="invalid-feedback">{errors.address}</div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {institutionFullName && (
                                    <Alert variant="info" className="mb-3">
                                        <strong>Повна назва:</strong> {institutionFullName}
                                    </Alert>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FaDatabase className="me-2" />
                                        Назва бази даних
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={databaseName}
                                        readOnly
                                        className="bg-light"
                                        placeholder="Назва згенерується автоматично"
                                    />
                                    <Form.Text className="text-muted">
                                        Ця назва буде використана для створення бази даних вашого закладу
                                    </Form.Text>
                                </Form.Group>
                            </div>

                            <hr className="my-4" />

                            <div className="mb-4">
                                <h5 className="mb-3" style={{ color: 'rgba(105, 180, 185, 1)' }}>
                                    <FaUserTie className="me-2" />
                                    Дані адміністратора системи
                                </h5>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaUser className="me-2" />
                                                ПІБ адміністратора *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="adminFullName"
                                                className={getInputClass("adminFullName")}
                                                value={formData.adminFullName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Наприклад: Іваненко Петро Сидорович"
                                                required
                                            />
                                            <div className="invalid-feedback">{errors.adminFullName}</div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaUserTie className="me-2" />
                                                Посада *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="adminPosition"
                                                className={getInputClass("adminPosition")}
                                                value={formData.adminPosition}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Наприклад: Директор"
                                                required
                                            />
                                            <div className="invalid-feedback">{errors.adminPosition}</div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaEnvelope className="me-2" />
                                                Електронна пошта *
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="adminEmail"
                                                className={getInputClass("adminEmail")}
                                                value={formData.adminEmail}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Наприклад: ivanenko.petro@gmail.com"
                                                required
                                            />
                                            <div className="invalid-feedback">{errors.adminEmail}</div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaPhone className="me-2" />
                                                Номер телефону *
                                            </Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="adminPhone"
                                                className={getInputClass("adminPhone")}
                                                value={formData.adminPhone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="+380XXXXXXXXX"
                                                required
                                            />
                                            <div className="invalid-feedback">{errors.adminPhone}</div>
                                            <Form.Text className="text-muted">
                                                Формат: +380XXXXXXXXX
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaLock className="me-2" />
                                                Пароль *
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="adminPassword"
                                                className={getInputClass("adminPassword")}
                                                value={formData.adminPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Мінімум 6 символів"
                                                required
                                            />
                                            <div className="invalid-feedback">{errors.adminPassword}</div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaLock className="me-2" />
                                                Підтвердження пароля *
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                className={getInputClass("confirmPassword")}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Повторіть пароль"
                                                required
                                            />
                                            <div className="invalid-feedback">{errors.confirmPassword}</div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            <Button
                                type="submit"
                                className="w-100 py-2"
                                disabled={loading}
                                style={{
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '16px'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Реєстрація...
                                    </>
                                ) : (
                                    'Зареєструвати навчальний заклад'
                                )}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default WelcomePage;