import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import InfoSection from "./InfoSection";
import ParentInfo from "./ParentInfo";

const StudentDetails = ({
    student,
    expandedParents,
    toggleParentExpansion,
    formatDate,
    isMobile
}) => {
    return (
        <div style={{
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            animation: 'slideDown 0.3s ease-out'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid rgba(105, 180, 185, 0.2)'
            }}>
                <FaInfoCircle size={20} color="rgba(105, 180, 185, 1)" />
                <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937'
                }}>
                    Детальна інформація про учня
                </h3>
            </div>

            <InfoSection student={student} formatDate={formatDate} isMobile={isMobile} />

            {student.parents && student.parents.length > 0 ? (
                <InfoSection icon="parents" title="Інформація про батьків">
                    <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                        Кількість батьків: <strong style={{ color: '#1f2937' }}>{student.parents.length}</strong>
                    </div>

                    {student.parents.map((parent, index) => (
                        <ParentInfo
                            key={parent._id || index}
                            parent={parent}
                            index={index}
                            studentId={student._id}
                            expandedParents={expandedParents}
                            toggleParentExpansion={toggleParentExpansion}
                            formatDate={formatDate}
                        />
                    ))}
                </InfoSection>
            ) : (
                <InfoSection icon="parents" title="Інформація про батьків">
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#9ca3af',
                        fontSize: '14px'
                    }}>
                        Інформація про батьків відсутня
                    </div>
                </InfoSection>
            )}
        </div>
    );
};

export default StudentDetails;