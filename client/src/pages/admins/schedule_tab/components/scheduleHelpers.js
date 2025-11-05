export const getSubjectName = (teacher) => {
    if (!teacher) return "Невідомий предмет";

    if (teacher.position) {
        return teacher.position;
    }
    if (teacher.positions && teacher.positions.length > 0) {
        return teacher.positions[0];
    }

    return "Предмет не вказано";
};

export const getDayOfWeek = (dayNumber) => {
    const days = {
        1: "Понеділок",
        2: "Вівторок",
        3: "Середа",
        4: "Четвер",
        5: "П'ятниця",
        6: "Субота",
        7: "Неділя"
    };
    return days[dayNumber] || `День ${dayNumber}`;
};

export const getLessonType = (type) => {
    const types = {
        "lecture": "Лекція",
        "practice": "Практика",
        "lab": "Лабораторна"
    };
    return types[type] || type;
};

export const getCardColorClass = (lessonType) => {
    const colorMap = {
        "lecture": "primary",
        "practice": "success",
        "lab": "warning"
    };
    return `border-${colorMap[lessonType] || "secondary"}`;
};