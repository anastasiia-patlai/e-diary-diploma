import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaChartLine, FaCalendarAlt, FaBookOpen } from "react-icons/fa";

const GradesTab = ({ databaseName, userData, isMobile }) => {
    const { t } = useTranslation();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState("all");

    useEffect(() => {
        fetchGrades();
    }, [databaseName, userData]);

    const fetchGrades = async () => {
        try {
            setLoading(true);
            if (databaseName && userData?._id) {
                const response = await fetch(`/api/grades/student/${userData._id}?databaseName=${databaseName}`);
                if (response.ok) {
                    const data = await response.json();
                    setGrades(data);
                } else {
                    // Тестові дані
                    setGrades([
                        { subject: "Математика", grade: 9, date: "2024-03-10", teacher: "Іванова М.П.", type: "Контрольна робота" },
                        { subject: "Математика", grade: 8, date: "2024-03-05", teacher: "Іванова М.П.", type: "Домашнє завдання" },
                        { subject: "Українська мова", grade: 10, date: "2024-03-08", teacher: "Петренко О.В.", type: "Диктант" },
                        { subject: "Українська мова", grade: 9, date: "2024-03-01", teacher: "Петренко О.В.", type: "Твір" },
                        { subject: "Англійська мова", grade: 8, date: "2024-03-07", teacher: "Сміт Дж.", type: "Лексичний тест" },
                        { subject: "Англійська мова", grade: 7, date: "2024-02-28", teacher: "Сміт Дж.", type: "Граматичний тест" }
                    ]);
                }
            } else {
                // Тестові дані
                setGrades([
                    { subject: "Математика", grade: 9, date: "2024-03-10", teacher: "Іванова М.П.", type: "Контрольна робота" },
                    { subject: "Математика", grade: 8, date: "2024-03-05", teacher: "Іванова М.П.", type: "Домашнє завдання" },
                    { subject: "Українська мова", grade: 10, date: "2024-03-08", teacher: "Петренко О.В.", type: "Диктант" }
                ]);
            }
        } catch (error) {
            console.error('Помилка отримання оцінок:', error);
        } finally {
            setLoading(false);
        }
    };

    const subjects = [...new Set(grades.map(g => g.subject))];
    const filteredGrades = selectedSubject === "all"
        ? grades
        : grades.filter(g => g.subject === selectedSubject);

    const getGradeColor = (grade) => {
        if (grade >= 9) return "#4caf50";
        if (grade >= 7) return "#ff9800";
        return "#f44336";
    };

    const calculateAverage = () => {
        if (filteredGrades.length === 0) return 0;
        const sum = filteredGrades.reduce((acc, g) => acc + g.grade, 0);
        return (sum / filteredGrades.length).toFixed(1);
    };

    if (loading) {
        return <div>{t("common.loading")}</div>;
    }

    return (
        <div>
            <h3 style={{ fontSize: isMobile ? '18px' : '24px', marginBottom: '20px' }}>
                {t("student.grades.title")}
            </h3>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                padding: '20px',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{t("student.grades.averageGrade")}</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: getGradeColor(calculateAverage()) }}>
                            {calculateAverage()}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{t("student.grades.totalGrades")}</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{filteredGrades.length}</div>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">{t("student.grades.allSubjects")}</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1.5fr 2fr',
                    gap: '10px',
                    padding: '15px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '12px' : '14px'
                }}>
                    <div>{t("student.grades.subject")}</div>
                    {!isMobile && <div>{t("student.grades.type")}</div>}
                    <div>{t("student.grades.grade")}</div>
                    <div>{t("student.grades.date")}</div>
                </div>

                {filteredGrades.map((grade, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1.5fr 2fr',
                            gap: '10px',
                            padding: '15px',
                            borderBottom: index !== filteredGrades.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: '500' }}>{grade.subject}</div>
                            {isMobile && <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{grade.type}</div>}
                        </div>
                        {!isMobile && <div>{grade.type}</div>}
                        <div>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: getGradeColor(grade.grade),
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                {grade.grade}
                            </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            {new Date(grade.date).toLocaleDateString()}
                        </div>
                    </div>
                ))}

                {filteredGrades.length === 0 && (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#9ca3af'
                    }}>
                        {t("student.grades.noGrades")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradesTab;