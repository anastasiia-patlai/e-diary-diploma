import React from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaBook, FaUserFriends, FaDoorOpen, FaHistory } from 'react-icons/fa';

const ScheduleInfoCards = ({
    scheduleData,
    selectedSemesterData,
    semesterStatus,
    teacherName,
    isMobile = false
}) => {
    return (
        <Row className="mt-4">
            <Col md={6}>
                <Card className="border-0 bg-light">
                    <Card.Body>
                        <h6 className="mb-3">
                            <FaCalendarAlt className="me-2" />
                            Інформація про розклад
                        </h6>
                        <div className="small">
                            <div className="mb-1">
                                <span className="text-muted">Загальна кількість занять: </span>
                                <strong>{scheduleData.length}</strong>
                            </div>
                            <div className="mb-1">
                                <span className="text-muted">Обраний семестр: </span>
                                <strong>
                                    {selectedSemesterData?.name || 'Не обрано'}
                                </strong>
                            </div>
                            <div className="mb-1">
                                <span className="text-muted">Навчальний рік: </span>
                                <strong>
                                    {selectedSemesterData?.year || 'Не обрано'}
                                </strong>
                            </div>
                            <div className="mb-1">
                                <span className="text-muted">Статус семестру: </span>
                                {semesterStatus === 'active' ? (
                                    <Badge bg="success">Активний</Badge>
                                ) : semesterStatus === 'past' ? (
                                    <Badge bg="secondary" style={isMobile ? {
                                        fontSize: '0.7rem',
                                        padding: '0.15rem 0.4rem',
                                        lineHeight: '1.2'
                                    } : {}}>
                                        Завершений
                                    </Badge>
                                ) : semesterStatus === 'future' ? (
                                    <Badge bg="info">Майбутній</Badge>
                                ) : null}
                            </div>
                            <div>
                                <span className="text-muted">Викладач: </span>
                                <strong>{teacherName}</strong>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                {isMobile ? (
                    // Мобільна версія - відображаємо тільки картку легенди
                    <Card className="border-0 bg-light mt-3">
                        <Card.Body>
                            <h6 className="mb-3">
                                <FaClock className="me-2" />
                                Легенда
                            </h6>
                            <div className="small">
                                <div className="d-flex align-items-center mb-2">
                                    <FaBook className="me-2 text-success" />
                                    <span> - Предмет</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <FaUserFriends className="me-2 text-secondary" />
                                    <span> - Група/Клас</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <FaDoorOpen className="me-2 text-warning" />
                                    <span> - Аудиторія</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <Badge bg="info" className="me-2" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                                        Підгр. 1
                                    </Badge>
                                    <span> - Позначення підгрупи</span>
                                </div>
                                {/* Видалено блок "Завершений семестр (дати не актуальні)" */}
                            </div>
                        </Card.Body>
                    </Card>
                ) : (
                    // Десктопна версія
                    <Card className="border-0 bg-light">
                        <Card.Body>
                            <h6 className="mb-3">
                                <FaClock className="me-2" />
                                Легенда
                            </h6>
                            <div className="small">
                                <div className="d-flex align-items-center mb-2">
                                    <FaBook className="me-2 text-success" />
                                    <span> - Предмет</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <FaUserFriends className="me-2 text-secondary" />
                                    <span> - Група/Клас</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <FaDoorOpen className="me-2 text-warning" />
                                    <span> - Аудиторія</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <Badge bg="info" className="me-2">Підгр. 1</Badge>
                                    <span> - Позначення підгрупи</span>
                                </div>
                                {/* Видалено блок "Завершений семестр (дати не актуальні)" для десктопної версії */}
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </Col>
        </Row>
    );
};

export default ScheduleInfoCards;