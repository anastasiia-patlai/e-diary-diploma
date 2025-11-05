export const validateTimeSlots = (timeSlots) => {
    for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        if (!slot.startTime || !slot.endTime) {
            return "Усі поля повинні бути заповнені";
        }
        if (slot.startTime >= slot.endTime) {
            return `У уроку ${i + 1} час початку повинен бути раніше за час закінчення`;
        }
    }

    // Перевірка на перекриття часу
    for (let i = 0; i < timeSlots.length - 1; i++) {
        const currentEnd = timeSlots[i].endTime;
        const nextStart = timeSlots[i + 1].startTime;
        if (currentEnd > nextStart) {
            return `Урок ${i + 1} закінчується після початку уроку ${i + 2}`;
        }
    }

    return null;
};