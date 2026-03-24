import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
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
import LanguageSwitcher from './i18n/components/LanguageSwitcher';

const WelcomePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [formData, setFormData] = useState({
        institutionType: 'school',
        number: '',
        name: '',
        honoraryName: '',
        city: '',
        address: '',
        adminFullName: '',
        adminPosition: t('welcome.defaults.principal'),
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
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://localhost:3001/api';

    const institutionTypes = [
        { value: 'school', label: t('welcome.institutionTypes.school') },
        { value: 'gymnasium', label: t('welcome.institutionTypes.gymnasium') },
        { value: 'lyceum', label: t('welcome.institutionTypes.lyceum') },
        { value: 'college', label: t('welcome.institutionTypes.college') },
        { value: 'university', label: t('welcome.institutionTypes.university') }
    ];

    const backgroundStyle = {
        backgroundImage: "url('/images/background-start.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        padding: isMobile ? '1rem' : '0',
        position: 'relative'
    };

    // Відслідковуємо зміну розміру вікна
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                if (!value) error = t('welcome.errors.institutionTypeRequired');
                break;
            case 'number':
                if (['school', 'gymnasium', 'lyceum'].includes(formData.institutionType)) {
                    if (!value) error = t('welcome.errors.numberRequired');
                    else if (!value.trim()) error = t('welcome.errors.numberEmpty');
                }
                break;
            case 'city':
                if (!value) error = t('welcome.errors.cityRequired');
                else if (!value.trim()) error = t('welcome.errors.cityEmpty');
                break;
            case 'address':
                if (!value) error = t('welcome.errors.addressRequired');
                else if (!value.trim()) error = t('welcome.errors.addressEmpty');
                break;
            case 'adminFullName':
                if (!value) error = t('welcome.errors.adminNameRequired');
                else if (!value.trim()) error = t('welcome.errors.adminNameEmpty');
                break;
            case 'adminPosition':
                if (!value) error = t('welcome.errors.adminPositionRequired');
                else if (!value.trim()) error = t('welcome.errors.adminPositionEmpty');
                break;
            case 'adminEmail':
                if (!value) error = t('welcome.errors.emailRequired');
                else if (!/\S+@\S+\.\S+/.test(value)) error = t('welcome.errors.emailInvalid');
                break;
            case 'adminPhone':
                if (!value) error = t('welcome.errors.phoneRequired');
                else if (!/^\+380\d{9}$/.test(value.replace(/\s/g, ''))) error = t('welcome.errors.phoneInvalid');
                break;
            case 'adminPassword':
                if (!value) error = t('welcome.errors.passwordRequired');
                else if (value.length < 6) error = t('welcome.errors.passwordMinLength');
                break;
            case 'confirmPassword':
                if (!value) error = t('welcome.errors.confirmPasswordRequired');
                else if (value !== formData.adminPassword) error = t('welcome.errors.passwordMismatch');
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
            school: t('welcome.institutionTypes.school'),
            gymnasium: t('welcome.institutionTypes.gymnasium'),
            lyceum: t('welcome.institutionTypes.lyceum'),
            college: t('welcome.institutionTypes.college'),
            university: t('welcome.institutionTypes.university')
        };

        let fullName = typeNames[type];

        if (number && ['school', 'gymnasium', 'lyceum'].includes(type)) {
            fullName += ` №${number}`;
        }

        if (name) {
            fullName += ` ${name}`;
        }

        if (honoraryName) {
            fullName += ` ${t('welcome.namedAfter')} ${honoraryName}`;
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

        // Валідуємо всі поля
        Object.keys(formData).forEach((field) => {
            setTouched((prev) => ({ ...prev, [field]: true }));
            validateField(field, formData[field]);
        });

        if (Object.values(errors).some((err) => err)) {
            setError(t('welcome.errors.formError'));
            return;
        }

        if (['school', 'gymnasium', 'lyceum'].includes(formData.institutionType) && !formData.number) {
            setError(t('welcome.errors.numberRequiredForType'));
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/school/register`, formData);

            navigate('/login', {
                state: {
                    message: t('welcome.success.registrationSuccess')
                }
            });

        } catch (error) {
            console.error('Error registering school:', error);

            if (error.response?.status === 400) {
                if (error.response?.data?.message === 'Навчальний заклад вже зареєстрований в системі') {
                    setError(t('welcome.errors.schoolExists'));
                } else if (error.response?.data?.message === 'База даних з такою назвою вже існує') {
                    setError(t('welcome.errors.databaseExists'));
                } else {
                    setError(error.response?.data?.message || t('welcome.errors.registrationError'));
                }
            } else if (error.response?.status === 500) {
                setError(t('welcome.errors.serverError'));
            } else {
                setError(t('welcome.errors.registrationError'));
            }
        } finally {
            setLoading(false);
        }
    };

    // Пустий обробник для LanguageSwitcher (на WelcomePage немає виходу)
    const handleLogout = () => { };

    // АДАПТИВНІ КОЛОНКИ
    const getResponsiveCol = () => {
        return isMobile ? 12 : 6;
    };

    // РОЗРАХУНОК КІЛЬКОСТІ ПОЛІВ ДЛЯ ДИНАМІЧНОГО ВІДОБРАЖЕННЯ
    const getDynamicFields = () => {
        const fields = [];
        const colSize = getResponsiveCol();

        // Завжди додаємо тип закладу
        fields.push(
            <Col xs={12} md={colSize} key="institutionType">
                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                        {!isMobile && <FaSchool className="me-2" />}
                        {t('welcome.labels.institutionType')} *
                    </Form.Label>
                    <Form.Select
                        name="institutionType"
                        className={getInputClass("institutionType")}
                        value={formData.institutionType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        size={isMobile ? "lg" : undefined}
                        style={{ fontSize: isMobile ? '14px' : '16px' }}
                    >
                        {institutionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </Form.Select>
                    <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                        {errors.institutionType}
                    </div>
                </Form.Group>
            </Col>
        );

        // Для школи, гімназії, ліцею додаємо номер (обов'язковий)
        if (['school', 'gymnasium', 'lyceum'].includes(formData.institutionType)) {
            fields.push(
                <Col xs={12} md={colSize} key="number">
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                            <FaHashtag className="me-2" />
                            {t('welcome.labels.institutionNumber')} *
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="number"
                            className={getInputClass("number")}
                            value={formData.number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('welcome.placeholders.institutionNumber')}
                            required
                            size={isMobile ? "lg" : undefined}
                            style={{ fontSize: isMobile ? '14px' : '16px' }}
                        />
                        <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                            {errors.number}
                        </div>
                    </Form.Group>
                </Col>
            );
        }

        // Для коледжу додаємо номер (необов'язковий)
        if (formData.institutionType === 'college') {
            fields.push(
                <Col xs={12} md={colSize} key="number">
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                            <FaHashtag className="me-2" />
                            {t('welcome.labels.institutionNumber')}
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="number"
                            className={getInputClass("number")}
                            value={formData.number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('welcome.placeholders.institutionNumber')}
                            size={isMobile ? "lg" : undefined}
                            style={{ fontSize: isMobile ? '14px' : '16px' }}
                        />
                        <Form.Text className="text-muted" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                            {t('welcome.optional')}
                        </Form.Text>
                    </Form.Group>
                </Col>
            );
        }

        // Для гімназії та ліцею додаємо спеціалізацію
        if (['gymnasium', 'lyceum'].includes(formData.institutionType)) {
            fields.push(
                <Col xs={12} md={colSize} key="name">
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                            {t('welcome.labels.specialization')}
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            className={getInputClass("name")}
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('welcome.placeholders.specialization')}
                            size={isMobile ? "lg" : undefined}
                            style={{ fontSize: isMobile ? '14px' : '16px' }}
                        />
                        <Form.Text className="text-muted" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                            {t('welcome.optional')}
                        </Form.Text>
                    </Form.Group>
                </Col>
            );
        }

        // "ІМЕНІ" ДЛЯ ГІМНАЗІЇ, ЛІЦЕЮ, КОЛЕДЖУ ТА УНІВЕРСИТЕТУ
        if (['gymnasium', 'lyceum', 'college', 'university'].includes(formData.institutionType)) {
            fields.push(
                <Col xs={12} md={colSize} key="honoraryName">
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                            {t('welcome.labels.namedAfter')}
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="honoraryName"
                            className={getInputClass("honoraryName")}
                            value={formData.honoraryName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('welcome.placeholders.namedAfter')}
                            size={isMobile ? "lg" : undefined}
                            style={{ fontSize: isMobile ? '14px' : '16px' }}
                        />
                        <Form.Text className="text-muted" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                            {t('welcome.optional')}
                        </Form.Text>
                    </Form.Group>
                </Col>
            );
        }

        return fields;
    };

    const colSize = getResponsiveCol();

    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center py-3" style={backgroundStyle}>
            {/* LanguageSwitcher для десктопу - у верхньому правому куті */}
            {!isMobile && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    backgroundColor: 'rgba(105, 180, 185, 0.7)',
                    borderRadius: '12px',
                    padding: '2px',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
                }}>
                    <LanguageSwitcher onLogout={handleLogout} isLoginPage={false} />
                </div>
            )}

            <div className={isMobile ? "w-100 px-2" : "w-100"} style={{ maxWidth: isMobile ? '100%' : '785px' }}>
                {/* LanguageSwitcher для мобільної версії - компактний, без зайвого фону */}
                {isMobile && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '10px',
                        marginTop: '5px',
                        // backgroundColor: 'rgba(105, 180, 185, 0.7)',
                        borderRadius: '12px',
                        padding: '2px',
                        // backdropFilter: 'blur(4px)',
                        // boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
                    }}>
                        <LanguageSwitcher onLogout={handleLogout} isLoginPage={false} />
                    </div>
                )}

                <Card className="shadow-lg border-0" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    margin: isMobile ? '0.5rem' : '0'
                }}>
                    <Card.Header className="text-white text-center py-3" style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        padding: isMobile ? '1rem' : '1.5rem'
                    }}>
                        <FaSchool size={isMobile ? 32 : 48} className="mb-2" />
                        <h2 className="mb-0" style={{ fontSize: isMobile ? '20px' : '24px' }}>
                            {t('welcome.title')}
                        </h2>
                        <p className="mb-0 mt-2 opacity-75" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            {t('welcome.subtitle')}
                        </p>
                    </Card.Header>

                    <Card.Body className="p-3" style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
                        {error && (
                            <Alert variant="danger" className="mb-3" style={{ fontSize: isMobile ? '14px' : '14px' }}>
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit} noValidate>
                            <div className="mb-3">
                                <h5 className="mb-2" style={{
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '16px' : '18px'
                                }}>
                                    {!isMobile && <FaSchool className="me-2" />}
                                    {t('welcome.sections.institutionInfo')}
                                </h5>

                                <Row>
                                    {getDynamicFields()}
                                </Row>

                                <Row>
                                    <Col xs={12} md={colSize}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                                <FaCity className="me-2" />
                                                {t('welcome.labels.city')} *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                className={getInputClass("city")}
                                                value={formData.city}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder={t('welcome.placeholders.city')}
                                                required
                                                size={isMobile ? "lg" : undefined}
                                                style={{ fontSize: isMobile ? '14px' : '16px' }}
                                            />
                                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {errors.city}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={colSize}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                                <FaMapMarkerAlt className="me-2" />
                                                {t('welcome.labels.address')} *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                className={getInputClass("address")}
                                                value={formData.address}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder={t('welcome.placeholders.address')}
                                                required
                                                size={isMobile ? "lg" : undefined}
                                                style={{ fontSize: isMobile ? '14px' : '16px' }}
                                            />
                                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {errors.address}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {institutionFullName && (
                                    <Alert variant="info" className="mb-2" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                                        <strong>{t('welcome.fullName')}:</strong> {institutionFullName}
                                    </Alert>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                        <FaDatabase className="me-2" />
                                        {t('welcome.labels.databaseName')}
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={databaseName}
                                        readOnly
                                        className="bg-light"
                                        placeholder={t('welcome.placeholders.databaseName')}
                                        size={isMobile ? "lg" : undefined}
                                        style={{ fontSize: isMobile ? '14px' : '16px' }}
                                    />
                                    <Form.Text className="text-muted" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                        {t('welcome.databaseHint')}
                                    </Form.Text>
                                </Form.Group>
                            </div>

                            <hr className="my-3" />

                            <div className="mb-3">
                                <h5 className="mb-2" style={{
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '16px' : '18px'
                                }}>
                                    {!isMobile && <FaUserTie className="me-2" />}
                                    {t('welcome.sections.adminInfo')}
                                </h5>

                                <Row>
                                    <Col xs={12} md={colSize}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                                <FaUser className="me-2" />
                                                {t('welcome.labels.adminFullName')} *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="adminFullName"
                                                className={getInputClass("adminFullName")}
                                                value={formData.adminFullName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder={t('welcome.placeholders.adminFullName')}
                                                required
                                                size={isMobile ? "lg" : undefined}
                                                style={{ fontSize: isMobile ? '14px' : '16px' }}
                                            />
                                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {errors.adminFullName}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={colSize}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                                <FaUserTie className="me-2" />
                                                {t('welcome.labels.adminPosition')} *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="adminPosition"
                                                className={getInputClass("adminPosition")}
                                                value={formData.adminPosition}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder={t('welcome.placeholders.adminPosition')}
                                                required
                                                size={isMobile ? "lg" : undefined}
                                                style={{ fontSize: isMobile ? '14px' : '16px' }}
                                            />
                                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {errors.adminPosition}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col xs={12} md={colSize}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                                <FaEnvelope className="me-2" />
                                                {t('welcome.labels.adminEmail')} *
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="adminEmail"
                                                className={getInputClass("adminEmail")}
                                                value={formData.adminEmail}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder={t('welcome.placeholders.adminEmail')}
                                                required
                                                size={isMobile ? "lg" : undefined}
                                                style={{ fontSize: isMobile ? '14px' : '16px' }}
                                            />
                                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {errors.adminEmail}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={colSize}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                                <FaPhone className="me-2" />
                                                {t('welcome.labels.adminPhone')} *
                                            </Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="adminPhone"
                                                className={getInputClass("adminPhone")}
                                                value={formData.adminPhone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder={t('welcome.placeholders.adminPhone')}
                                                required
                                                size={isMobile ? "lg" : undefined}
                                                style={{ fontSize: isMobile ? '14px' : '16px' }}
                                            />
                                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {errors.adminPhone}
                                            </div>
                                            <Form.Text className="text-muted" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {t('welcome.phoneHint')}
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col xs={12} md={colSize}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                                <FaLock className="me-2" />
                                                {t('welcome.labels.password')} *
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="adminPassword"
                                                className={getInputClass("adminPassword")}
                                                value={formData.adminPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder={t('welcome.placeholders.password')}
                                                required
                                                size={isMobile ? "lg" : undefined}
                                                style={{ fontSize: isMobile ? '14px' : '16px' }}
                                            />
                                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {errors.adminPassword}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={colSize}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontSize: isMobile ? '16px' : '14px' }}>
                                                <FaLock className="me-2" />
                                                {t('welcome.labels.confirmPassword')} *
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                className={getInputClass("confirmPassword")}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder={t('welcome.placeholders.confirmPassword')}
                                                required
                                                size={isMobile ? "lg" : undefined}
                                                style={{ fontSize: isMobile ? '14px' : '16px' }}
                                            />
                                            <div className="invalid-feedback" style={{ fontSize: isMobile ? '14px' : '12px' }}>
                                                {errors.confirmPassword}
                                            </div>
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
                                    fontSize: isMobile ? '16px' : '16px',
                                    padding: isMobile ? '0.75rem' : '0.5rem'
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
                                        <Spinner animation="border" size={isMobile ? "sm" : "sm"} className="me-2" />
                                        {t('welcome.buttons.registering')}
                                    </>
                                ) : (
                                    t('welcome.buttons.register')
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