import React from "react";
import {
    FaSchool,
    FaUserGraduate,
    FaEnvelope,
    FaChevronUp,
    FaChevronDown,
    FaInfoCircle
} from "react-icons/fa";
import StudentDetails from "./StudentDetails";

const StudentsList = ({
    filteredStudents,
    expandedStudent,
    toggleStudentExpansion,
    expandedParents,
    toggleParentExpansion,
    formatDate,
    sortOrder,
    isMobile
}) => {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
        }}>
            <div style={{
                display: isMobile ? 'none' : 'grid',
                gridTemplateColumns: '3fr 2fr 1fr',
                gap: '16px',
                padding: '16px 24px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
            }}>
                <div>Учень {sortOrder === "asc" ? "↑" : "↓"}</div>
                <div>Група</div>
                <div style={{ textAlign: 'right' }}>Деталі</div>
            </div>

            <div>
                {filteredStudents.map((student) => (
                    <div key={student._id} style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s'
                    }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                justifyContent: isMobile ? 'flex-start' : 'space-between',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: isMobile ? '12px' : '16px',
                                padding: isMobile ? '16px' : '16px 24px',
                                cursor: 'pointer'
                            }}
                            onClick={() => toggleStudentExpansion(student._id)}
                            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.backgroundColor = 'white')}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flex: 1
                            }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <FaUserGraduate color="rgba(105, 180, 185, 1)" size={20} />
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '4px'
                                    }}>
                                        {student.fullName}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                minWidth: isMobile ? '100%' : '120px'
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontWeight: '500'
                                }}>
                                    {expandedStudent === student._id ? 'Згорнути' : 'Детальніше'}
                                </span>
                                {expandedStudent === student._id ? (
                                    <FaChevronUp color="rgba(105, 180, 185, 1)" />
                                ) : (
                                    <FaChevronDown color="rgba(105, 180, 185, 1)" />
                                )}
                            </div>
                        </div>

                        {expandedStudent === student._id && (
                            <StudentDetails
                                student={student}
                                expandedParents={expandedParents}
                                toggleParentExpansion={toggleParentExpansion}
                                formatDate={formatDate}
                                isMobile={isMobile}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentsList;