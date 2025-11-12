import React from "react";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBriefcase,
    FaMapMarkerAlt,
    FaBirthdayCake,
    FaCalendar,
    FaUserCog,
    FaUsers
} from "react-icons/fa";

const AdminInfo = ({ userData }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Не вказано';
        try {
            return new Date(dateString).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Не вказано';
        }
    };

    const getRoleDisplayName = (role) => {
        const roles = {
            'admin': 'Адміністратор',
            'teacher': 'Вчитель',
            'student': 'Учень',
            'parent': 'Батько'
        };
        return roles[role] || 'Користувач';
    };

    if (!userData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                fontSize: '18px',
                color: '#666'
            }}>
                Завантаження інформації...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '32px',
                    paddingBottom: '24px',
                    borderBottom: '2px solid #f3f4f6'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '20px'
                    }}>
                        <FaUser size={32} color="rgba(105, 180, 185, 1)" />
                    </div>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#1f2937'
                        }}>
                            {userData.fullName}
                        </h1>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '8px'
                        }}>
                            <FaUserCog color="rgba(105, 180, 185, 1)" />
                            <span style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                fontWeight: '500'
                            }}>
                                {getRoleDisplayName(userData.role)}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Контактна інформація
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FaEnvelope color="rgba(105, 180, 185, 1)" />
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            marginBottom: '2px'
                                        }}>
                                            Електронна пошта
                                        </div>
                                        <div style={{
                                            fontSize: '16px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {userData.email || 'Не вказано'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FaPhone color="rgba(105, 180, 185, 1)" />
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            marginBottom: '2px'
                                        }}>
                                            Телефон
                                        </div>
                                        <div style={{
                                            fontSize: '16px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {userData.phone || 'Не вказано'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Профільна інформація
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FaBriefcase color="rgba(105, 180, 185, 1)" />
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            marginBottom: '2px'
                                        }}>
                                            Посада
                                        </div>
                                        <div style={{
                                            fontSize: '16px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {userData.position || 'Не вказано'}
                                        </div>
                                        {userData.positions && userData.positions.length > 1 && (
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginTop: '4px'
                                            }}>
                                                Додатково: {userData.positions.slice(1).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FaBirthdayCake color="rgba(105, 180, 185, 1)" />
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            marginBottom: '2px'
                                        }}>
                                            Дата народження
                                        </div>
                                        <div style={{
                                            fontSize: '16px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {formatDate(userData.birthDate)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FaCalendar color="rgba(105, 180, 185, 1)" />
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            marginBottom: '2px'
                                        }}>
                                            Дата реєстрації
                                        </div>
                                        <div style={{
                                            fontSize: '16px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {formatDate(userData.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '32px',
                    padding: '20px',
                    backgroundColor: 'rgba(105, 180, 185, 0.05)',
                    border: '1px solid rgba(105, 180, 185, 0.2)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <FaUserCog color="rgba(105, 180, 185, 1)" />
                        <span style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'rgba(105, 180, 185, 1)'
                        }}>
                            Статус: {getRoleDisplayName(userData.role)}
                        </span>
                    </div>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6b7280'
                    }}>
                        {userData.role === 'admin'
                            ? 'Ви маєте повний доступ до всіх функцій системи управління навчальним закладом'
                            : 'Обмежений доступ до функцій системи'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminInfo;