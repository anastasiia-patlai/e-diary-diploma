import axios from 'axios';

const API_URL = 'http://localhost:3001/api/study-calendar';

const getDatabaseName = () => {
    let dbName = localStorage.getItem('databaseName');

    if (!dbName) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.databaseName) {
                    dbName = user.databaseName;
                }
            } catch (e) {
                console.error("Помилка парсингу user:", e);
            }
        }
    }

    if (!dbName) {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            try {
                const userInfo = JSON.parse(userInfoStr);
                if (userInfo.databaseName) {
                    dbName = userInfo.databaseName;
                }
            } catch (e) {
                console.error("Помилка парсингу userInfo:", e);
            }
        }
    }

    return dbName;
};

const studyCalendarService = {
    // СЕМЕСТРИ
    getSemesters: () => {
        const databaseName = getDatabaseName();
        return axios.get(`${API_URL}/semesters`, {
            params: { databaseName }
        });
    },
    createSemester: (data) => {
        const databaseName = getDatabaseName();
        return axios.post(`${API_URL}/semesters`, {
            ...data,
            databaseName
        });
    },
    updateSemester: (id, data) => {
        const databaseName = getDatabaseName();
        return axios.put(`${API_URL}/semesters/${id}`, {
            ...data,
            databaseName
        });
    },
    deleteSemester: (id) => {
        const databaseName = getDatabaseName();
        return axios.delete(`${API_URL}/semesters/${id}`, {
            data: { databaseName }
        });
    },

    // СИНХРОНІЗАЦІЯ АКТИВНОСТІ СЕМЕСТРІВ ТА ЧВЕРТЕЙ
    syncSemesterQuarters: (semesterId) => {
        const databaseName = getDatabaseName();
        return axios.put(`${API_URL}/semesters/${semesterId}/sync-quarters`, {
            databaseName
        });
    },
    deactivateAllQuarters: () => {
        const databaseName = getDatabaseName();
        return axios.put(`${API_URL}/quarters/deactivate-all`, {
            databaseName
        });
    },

    // АВТОМАТИЧНЕ ОНОВЛЕННЯ СЕМЕСТРІВ 
    autoUpdateSemesters: () => {
        const databaseName = getDatabaseName();
        return axios.get(`${API_URL}/semesters`, {
            params: { databaseName }
        });
    },

    // ЧВЕРТІ
    getQuarters: () => {
        const databaseName = getDatabaseName();
        return axios.get(`${API_URL}/quarters`, {
            params: { databaseName }
        });
    },
    createQuarter: (data) => {
        const databaseName = getDatabaseName();
        return axios.post(`${API_URL}/quarters`, {
            ...data,
            databaseName
        });
    },
    updateQuarter: (id, data) => {
        const databaseName = getDatabaseName();
        return axios.put(`${API_URL}/quarters/${id}`, {
            ...data,
            databaseName
        });
    },
    deleteQuarter: (id) => {
        const databaseName = getDatabaseName();
        return axios.delete(`${API_URL}/quarters/${id}`, {
            data: { databaseName }
        });
    },

    // КАНІКУЛИ
    getHolidays: () => {
        const databaseName = getDatabaseName();
        return axios.get(`${API_URL}/holidays`, {
            params: { databaseName }
        });
    },
    createHoliday: (data) => {
        const databaseName = getDatabaseName();
        return axios.post(`${API_URL}/holidays`, {
            ...data,
            databaseName
        });
    },
    updateHoliday: (id, data) => {
        const databaseName = getDatabaseName();
        return axios.put(`${API_URL}/holidays/${id}`, {
            ...data,
            databaseName
        });
    },
    deleteHoliday: (id) => {
        const databaseName = getDatabaseName();
        return axios.delete(`${API_URL}/holidays/${id}`, {
            data: { databaseName }
        });
    }
};

export default studyCalendarService;