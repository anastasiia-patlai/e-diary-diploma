export const validateTimeSlots = (timeSlots) => {
    // ПЕРЕВІРКА ЗАПОВНЕННОСТІ ТА ЛОГІКИ ЧАСУ
    for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        if (!slot.startTime || !slot.endTime) {
            return "Усі поля повинні бути заповнені";
        }
        if (slot.startTime >= slot.endTime) {
            return `Урок ${i + 1} час початку повинен бути раніше за час закінчення`;
        }
    }

    // ПЕРЕВІРКА ПЕРЕКРИВАННЯ ЧАСІВ
    const sortedSlots = [...timeSlots].sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedSlots.length - 1; i++) {
        const currentEnd = sortedSlots[i].endTime;
        const nextStart = sortedSlots[i + 1].startTime;
        if (currentEnd > nextStart) {
            return `Урок ${i + 1} закінчується після початку уроку ${i + 2}`;
        }
    }

    // ПЕРЕВІРКА УНІКАЛЬНОСТІ ПОРЯДКУ
    const orders = sortedSlots.map(slot => slot.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        return "Порядок уроків повинен бути унікальним";
    }

    return null;
};