import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaClock, FaUpload, FaFileAlt, FaSpinner } from "react-icons/fa";

const HomeworkTab = ({ databaseName, userData, isMobile }) => {
    const { t } = useTranslation();
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHomework, setSelectedHomework] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchHomework();
    }, [databaseName, userData]);

    const fetchHomework = async () => {
        try {
            setLoading(true);
            if (databaseName && userData?.groupId) {
                const response = await fetch(`/api/homework/group/${userData.groupId}?databaseName=${databaseName}`);
                if (response.ok) {
                    const data = await response.json();
                    setHomework(data);
                } else {
                    // Тестові дані
                    setHomework([
                        {
                            _id: "1",
                            subject: "Математика",
                            title: "Розв'язати рівняння",
                            description: "Виконати вправи №345-350 на сторінці 78",
                            dueDate: "2024-03-15",
                            status: "pending",
                            createdAt: "2024-03-10"
                        },
                        {
                            _id: "2",
                            subject: "Українська мова",
                            title: "Написати твір",
                            description: "Тема: 'Моя улюблена пора року'",
                            dueDate: "2024-03-17",
                            status: "pending",
                            createdAt: "2024-03-09"
                        },
                        {
                            _id: "3",
                            subject: "Англійська мова",
                            title: "Вивчити нові слова",
                            description: "Сторінка 45, слова з теми 'School'",
                            dueDate: "2024-03-12",
                            status: "completed",
                            createdAt: "2024-03-08"
                        }
                    ]);
                }
            } else {
                // Тестові дані
                setHomework([
                    {
                        _id: "1",
                        subject: "Математика",
                        title: "Розв'язати рівняння",
                        description: "Виконати вправи №345-350 на сторінці 78",
                        dueDate: "2024-03-15",
                        status: "pending",
                        createdAt: "2024-03-10"
                    },
                    {
                        _id: "2",
                        subject: "Українська мова",
                        title: "Написати твір",
                        description: "Тема: 'Моя улюблена пора року'",
                        dueDate: "2024-03-17",
                        status: "pending",
                        createdAt: "2024-03-09"
                    }
                ]);
            }
        } catch (error) {
            console.error('Помилка отримання домашніх завдань:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitHomework = async (homeworkId) => {
        setSubmitting(true);
        try {
            // Тут буде API запит для відправки домашнього завдання
            await new Promise(resolve => setTimeout(resolve, 1000));

            setHomework(homework.map(h =>
                h._id === homeworkId ? { ...h, status: "submitted" } : h
            ));

            alert(t("student.homework.submitSuccess"));
        } catch (error) {
            console.error('Помилка відправки:', error);
            alert(t("student.homework.submitError"));
        } finally {
            setSubmitting(false);
            setSelectedHomework(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "#4caf50";
            case "submitted": return "#2196f3";
            default: return "#ff9800";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "completed": return t("student.homework.completed");
            case "submitted": return t("student.homework.submitted");
            default: return t("student.homework.pending");
        }
    };

    if (loading) {
        return <div>{t("common.loading")}</div>;
    }

    return (
        <div>
            <h3 style={{ fontSize: isMobile ? '18px' : '24px', marginBottom: '20px' }}>
                {t("student.homework.title")}
            </h3>

            <div style={{
                display: 'grid',
                gap: '15px',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))'
            }}>
                {homework.map((hw) => (
                    <div
                        key={hw._id}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            padding: '20px',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: getStatusColor(hw.status),
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            {getStatusText(hw.status)}
                        </div>

                        <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{hw.subject}</h4>
                        <h5 style={{ margin: '0 0 10px 0', color: '#666' }}>{hw.title}</h5>

                        <p style={{ margin: '10px 0', lineHeight: '1.5' }}>
                            {hw.description}
                        </p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '15px',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#666' }}>
                                <FaClock />
                                <span>{t("student.homework.dueDate")}: {new Date(hw.dueDate).toLocaleDateString()}</span>
                            </div>

                            {hw.status === "pending" && (
                                <button
                                    onClick={() => setSelectedHomework(hw._id)}
                                    style={{
                                        backgroundColor: 'rgba(105, 180, 185, 1)',
                                        color: 'white',
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <FaUpload />
                                    {t("student.homework.submit")}
                                </button>
                            )}

                            {hw.status === "submitted" && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2196f3' }}>
                                    <FaCheckCircle />
                                    <span>{t("student.homework.waitingCheck")}</span>
                                </div>
                            )}

                            {hw.status === "completed" && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4caf50' }}>
                                    <FaCheckCircle />
                                    <span>{t("student.homework.checked")}</span>
                                </div>
                            )}
                        </div>

                        {selectedHomework === hw._id && (
                            <div style={{
                                marginTop: '15px',
                                paddingTop: '15px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <textarea
                                    placeholder={t("student.homework.commentPlaceholder")}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        minHeight: '80px',
                                        fontSize: '14px',
                                        marginBottom: '10px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setSelectedHomework(null)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t("common.cancel")}
                                    </button>
                                    <button
                                        onClick={() => handleSubmitHomework(hw._id)}
                                        disabled={submitting}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                            color: 'white',
                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {submitting && <FaSpinner className="animate-spin" />}
                                        {t("student.homework.send")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {homework.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#9ca3af'
                    }}>
                        {t("student.homework.noHomework")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeworkTab;