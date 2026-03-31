import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaUserFriends, FaSearch, FaEnvelope, FaPhone } from "react-icons/fa";

const ClassmatesTab = ({ databaseName, userData, isMobile }) => {
    const { t } = useTranslation();
    const [classmates, setClassmates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchClassmates();
    }, [databaseName, userData]);

    const fetchClassmates = async () => {
        try {
            setLoading(true);
            if (databaseName && userData?.groupId) {
                const response = await fetch(`/api/groups/${userData.groupId}/students?databaseName=${databaseName}`);
                if (response.ok) {
                    const data = await response.json();
                    // Фільтруємо поточного користувача
                    setClassmates(data.filter(student => student._id !== userData._id));
                } else {
                    // Тестові дані
                    setClassmates([
                        { _id: "1", fullName: "Петренко Олександр", email: "olexandr@school.com", phone: "+380990000002" },
                        { _id: "2", fullName: "Коваленко Марія", email: "maria@school.com", phone: "+380990000003" },
                        { _id: "3", fullName: "Шевченко Андрій", email: "andriy@school.com", phone: "+380990000004" }
                    ]);
                }
            } else {
                // Тестові дані
                setClassmates([
                    { _id: "1", fullName: "Петренко Олександр", email: "olexandr@school.com", phone: "+380990000002" },
                    { _id: "2", fullName: "Коваленко Марія", email: "maria@school.com", phone: "+380990000003" },
                    { _id: "3", fullName: "Шевченко Андрій", email: "andriy@school.com", phone: "+380990000004" },
                    { _id: "4", fullName: "Бондаренко Олена", email: "olena@school.com", phone: "+380990000005" },
                    { _id: "5", fullName: "Мельник Дмитро", email: "dmytro@school.com", phone: "+380990000006" }
                ]);
            }
        } catch (error) {
            console.error('Помилка отримання однокласників:', error);
            setClassmates([
                { _id: "1", fullName: "Петренко Олександр", email: "olexandr@school.com", phone: "+380990000002" },
                { _id: "2", fullName: "Коваленко Марія", email: "maria@school.com", phone: "+380990000003" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredClassmates = classmates.filter(classmate =>
        classmate.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>{t("common.loading")}</div>;
    }

    return (
        <div>
            <h3 style={{ fontSize: isMobile ? '18px' : '24px', marginBottom: '20px' }}>
                {t("student.classmates.title")}
            </h3>

            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'white'
                }}>
                    <FaSearch style={{ color: '#9ca3af', marginRight: '8px' }} />
                    <input
                        type="text"
                        placeholder={t("student.classmates.search")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            flex: 1,
                            fontSize: '16px'
                        }}
                    />
                </div>
            </div>

            <div style={{
                display: 'grid',
                gap: '15px',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))'
            }}>
                {filteredClassmates.map((classmate) => (
                    <div
                        key={classmate._id}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            padding: '15px',
                            transition: 'box-shadow 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '10px'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: 'rgba(105, 180, 185, 1)'
                            }}>
                                {classmate.fullName.charAt(0)}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '16px' }}>{classmate.fullName}</h4>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                    {t("student.classmates.classmate")}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <a href={`mailto:${classmate.email}`} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    textDecoration: 'none',
                                    fontSize: '14px'
                                }}>
                                    <FaEnvelope /> {t("student.classmates.email")}
                                </a>
                                <a href={`tel:${classmate.phone}`} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    textDecoration: 'none',
                                    fontSize: '14px'
                                }}>
                                    <FaPhone /> {t("student.classmates.call")}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClassmates.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#9ca3af'
                }}>
                    {t("student.classmates.noResults")}
                </div>
            )}
        </div>
    );
};

export default ClassmatesTab;