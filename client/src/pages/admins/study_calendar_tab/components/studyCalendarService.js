import axios from 'axios';

const API_URL = 'http://localhost:3001/api/study-calendar';

const studyCalendarService = {
    // СЕМЕСТРИ
    getSemesters: () => axios.get(`${API_URL}/semesters`),
    createSemester: (data) => axios.post(`${API_URL}/semesters`, data),
    updateSemester: (id, data) => axios.put(`${API_URL}/semesters/${id}`, data),
    deleteSemester: (id) => axios.delete(`${API_URL}/semesters/${id}`),

    // СИНХРОНІЗАЦІЯ АКТИВНОСТІ СЕМЕСТРІВ ТА ЧВЕРТЕЙ
    syncSemesterQuarters: (semesterId) => axios.put(`${API_URL}/semesters/${semesterId}/sync-quarters`),
    deactivateAllQuarters: () => axios.put(`${API_URL}/quarters/deactivate-all`),

    // АВТОМАТИЧНЕ ОНОВЛЕННЯ СЕМЕСТРІВ 
    autoUpdateSemesters: () => {
        return axios.get(`${API_URL}/semesters`);
    },

    // ЧВЕРТІ
    getQuarters: () => axios.get(`${API_URL}/quarters`),
    createQuarter: (data) => axios.post(`${API_URL}/quarters`, data),
    updateQuarter: (id, data) => axios.put(`${API_URL}/quarters/${id}`, data),
    deleteQuarter: (id) => axios.delete(`${API_URL}/quarters/${id}`),

    // КАНІКУЛИ
    getHolidays: () => axios.get(`${API_URL}/holidays`),
    createHoliday: (data) => axios.post(`${API_URL}/holidays`, data),
    updateHoliday: (id, data) => axios.put(`${API_URL}/holidays/${id}`, data),
    deleteHoliday: (id) => axios.delete(`${API_URL}/holidays/${id}`)
};

export default studyCalendarService;