import React from 'react';

const StudentHeader = ({ onToggleAll, allExpanded, isMobile }) => {
    // ФУНКЦІЯ ДЛЯ ВИЗНАЧЕННЯ ТИПУ ЗАКЛАДУ
    const getInstitutionType = () => {
        // ОТРИМУЄМО ІНФОРМАЦІЮ ПРО ШКОЛУ З ЛОКАЛЬНОГО СХОВИЩА
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const schoolName = userInfo.schoolName || '';
        const institutionType = userInfo.institutionType || '';

        if (institutionType) {
            const lowerType = institutionType.toLowerCase();
            if (lowerType.includes('гімназія') || lowerType.includes('гимназия') ||
                lowerType.includes('школа') || lowerType.includes('школа')) {
                return 'school';
            } else if (lowerType.includes('університет') || lowerType.includes('университет') ||
                lowerType.includes('коледж') || lowerType.includes('колледж') ||
                lowerType.includes('ліцей') || lowerType.includes('лицей')) {
                return 'university';
            }
        }

        // АВТОМАТИЧНЕ ВИЗНАЧЕННЯ ЗА НАЗВОЮ НАВЧАЛЬНОГО ЗАКЛАДУ
        const lowerSchoolName = schoolName.toLowerCase();
        if (lowerSchoolName.includes('гімназія') || lowerSchoolName.includes('гимназия') ||
            lowerSchoolName.includes('школа') || lowerSchoolName.includes('школа') ||
            lowerSchoolName.includes('gymnasium') || lowerSchoolName.includes('school')) {
            return 'school';
        } else if (lowerSchoolName.includes('університет') || lowerSchoolName.includes('университет') ||
            lowerSchoolName.includes('коледж') || lowerSchoolName.includes('колледж') ||
            lowerSchoolName.includes('ліцей') || lowerSchoolName.includes('лицей') ||
            lowerSchoolName.includes('university') || lowerSchoolName.includes('college') ||
            lowerSchoolName.includes('lyceum')) {
            return 'university';
        }

        // ЗА ЗАМОВЧУВАННЯМ - ШКОЛУ
        return 'school';
    };

    // ВИЗНАЧАЄМО ЗАГОЛОВОК В ЗАЛЕЖНОСТІ ВІД ТИПУ ЗАКЛАДУ
    const getHeaderTitle = () => {
        const institutionType = getInstitutionType();

        if (institutionType === 'school') {
            return 'Список учнів за класами';
        } else {
            return 'Список студентів за групами';
        }
    };

    const headerTitle = getHeaderTitle();

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: isMobile ? '16px' : '20px',
            gap: isMobile ? '12px' : '0'
        }}>
            <h3 style={{
                margin: 0,
                fontSize: '24px',
                textAlign: isMobile ? 'center' : 'left'
            }}>
                {headerTitle}
            </h3>
            <button
                onClick={onToggleAll}
                style={{
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    padding: isMobile ? '12px 20px' : '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: isMobile ? '14px' : '12px',
                    width: isMobile ? '100%' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto'
                }}
            >
                {allExpanded ? 'Згорнути всі' : 'Розгорнути всі'}
            </button>
        </div>
    );
};

export default StudentHeader;