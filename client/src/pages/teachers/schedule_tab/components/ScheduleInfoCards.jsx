import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaBook, FaUserFriends, FaDoorOpen, FaUsers, FaInfoCircle } from 'react-icons/fa';

const ScheduleInfoCards = ({
    scheduleData,
    selectedSemesterData,
    semesterStatus,
    teacherName,
    isMobile = false
}) => {
    if (isMobile) {
        return (
            <div className="mt-4">
                {/* Блок інформації */}
                <Card className="border-0 bg-light mb-3">
                    <Card.Body>
                        <h6 className="mb-3">
                            <FaInfoCircle className="me-2" style={{ color: '#6c757d' }} />
                            Інформація про розклад
                        </h6>
                        <div className="small">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Загальна кількість занять:</span>
                                <strong>{scheduleData.length}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Обраний семестр:</span>
                                <strong>{selectedSemesterData?.name || 'Не обрано'}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Навчальний рік:</span>
                                <strong>{selectedSemesterData?.year || 'Не обрано'}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Статус семестру:</span>
                                {semesterStatus === 'active' ? (
                                    <Badge bg="success">Активний</Badge>
                                ) : semesterStatus === 'past' ? (
                                    <Badge bg="secondary">Завершений</Badge>
                                ) : semesterStatus === 'future' ? (
                                    <Badge bg="info">Майбутній</Badge>
                                ) : null}
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Викладач:</span>
                                <strong>{teacherName}</strong>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Блок легенди */}
                <Card className="border-0 bg-light">
                    <Card.Body>
                        <h6 className="mb-3">
                            <FaClock className="me-2" style={{ color: '#6c757d' }} />
                            Легенда
                        </h6>
                        <div className="small">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                    <FaBook className="me-2 text-success" size={14} />
                                    <span>Предмет</span>
                                </div>
                                <span className="text-muted">назва предмета</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                    <FaUserFriends className="me-2 text-secondary" size={14} />
                                    <span>Група/Клас</span>
                                </div>
                                <span className="text-muted">5-Б, 10-А</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                    <FaUsers className="me-2 text-info" size={14} />
                                    <span>Підгрупа</span>
                                </div>
                                <span className="text-muted">Підгрупа 1, Вся група</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                    <FaDoorOpen className="me-2 text-warning" size={14} />
                                    <span>Аудиторія</span>
                                </div>
                                <span className="text-muted">№ кабінету</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <Badge bg="info" className="me-2" style={{ fontSize: '11px', padding: '3px 8px' }}>
                                        Підгр. 1
                                    </Badge>
                                    <span>Позначення підгрупи</span>
                                </div>
                                <span className="text-muted">в картці уроку</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Блок легенди */}
            <Card className="bg-light" style={{ border: '1px solid #c0bebe', borderRadius: '8px', marginTop: '43px' }}>
                <Card.Body>
                    <h6 className="mb-3">
                        <FaClock className="me-2" style={{ color: '#6c757d' }} />
                        Легенда
                    </h6>
                    <div className="small">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                                <FaBook className="me-2 text-success" size={14} />
                                <span>Предмет</span>
                            </div>
                            <span className="text-muted">назва предмета</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                                <FaUserFriends className="me-2 text-secondary" size={14} />
                                <span>Група/Клас</span>
                            </div>
                            <span className="text-muted">5-Б, 10-А</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                                <FaUsers className="me-2 text-info" size={14} />
                                <span>Підгрупа</span>
                            </div>
                            <span className="text-muted">Підгрупа 1, Вся група</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                                <FaDoorOpen className="me-2 text-warning" size={14} />
                                <span>Аудиторія</span>
                            </div>
                            <span className="text-muted">№ кабінету</span>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Блок інформації */}
            <Card className="bg-light" style={{ border: '1px solid #c0bebe', borderRadius: '8px' }}>
                <Card.Body>
                    <h6 className="mb-3">
                        <FaInfoCircle className="me-2" style={{ color: '#6c757d' }} />
                        Інформація про розклад
                    </h6>
                    <div className="small">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Загальна кількість занять:</span>
                            <strong>{scheduleData.length}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Обраний семестр:</span>
                            <strong>{selectedSemesterData?.name || 'Не обрано'}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Навчальний рік:</span>
                            <strong>{selectedSemesterData?.year || 'Не обрано'}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Статус семестру:</span>
                            {semesterStatus === 'active' ? (
                                <Badge bg="success">Активний</Badge>
                            ) : semesterStatus === 'past' ? (
                                <Badge bg="secondary">Завершений</Badge>
                            ) : semesterStatus === 'future' ? (
                                <Badge bg="info">Майбутній</Badge>
                            ) : null}
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="text-muted">Викладач:</span>
                            <strong>{teacherName}</strong>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ScheduleInfoCards;