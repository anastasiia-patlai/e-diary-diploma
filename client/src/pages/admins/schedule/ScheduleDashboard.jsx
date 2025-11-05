import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";

import ScheduleHeader from "./ScheduleHeader";
import ScheduleList from "./ScheduleList";
import LoadingState from "./LoadingState";
import ScheduleStats from "./ScheduleStats";

import { getSubjectName, getDayOfWeek, getLessonType, getCardColorClass } from "./scheduleHelpers";

const ScheduleDashboard = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        teachers: [],
        groups: [],
        classrooms: []
    });

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/schedule");

            if (response.data && Array.isArray(response.data)) {
                setSchedules(response.data);
            } else {
                console.warn("Отримані дані не є масивом:", response.data);
                setSchedules([]);
            }
            setError("");
        } catch (err) {
            setError("Помилка при завантаженні розкладу: " + (err.response?.data?.message || err.message));
            console.error("Error loading schedules:", err);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const loadFormData = async () => {
        try {
            const response = await axios.get("/api/schedule/form-data");
            setFormData({
                teachers: Array.isArray(response.data?.teachers) ? response.data.teachers : [],
                groups: Array.isArray(response.data?.groups) ? response.data.groups : [],
                classrooms: Array.isArray(response.data?.classrooms) ? response.data.classrooms : []
            });
        } catch (err) {
            console.error("Error loading form data:", err);
            setFormData({ teachers: [], groups: [], classrooms: [] });
        }
    };

    useEffect(() => {
        loadSchedules();
        loadFormData();
    }, []);

    const handleAddSchedule = () => {
        // Тут буде відкриття модального вікна
        console.log("Додати нове заняття");
    };

    if (loading) {
        return <LoadingState />;
    }

    return (
        <Container fluid style={{ padding: "0 0 24px 0" }}>
            <ScheduleHeader onAddSchedule={handleAddSchedule} />

            {error && (
                <Row style={{ marginBottom: "16px" }}>
                    <Col>
                        <Alert variant="danger" dismissible onClose={() => setError("")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                borderRadius: "6px"
                            }}
                        >
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            <ScheduleList
                schedules={schedules}
                onRefresh={loadSchedules}
            />

            <ScheduleStats formData={formData} />
        </Container>
    );
};

export default ScheduleDashboard;