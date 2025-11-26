const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Додамо middleware для обробки підключення до бази даних
app.use(async (req, res, next) => {
    try {
        // Для маршрутів, які не потребують бази даних
        if (req.path === '/api/school/check-school' || req.path === '/api/school/register' || req.path === '/api/debug' || req.path === '/api/system/info') {
            return next();
        }

        // Для маршрутів, які потребують бази даних, ми повинні мати інформацію про школу
        // Поки що просто пропускаємо, але в майбутньому тут буде логіка вибору бази даних школи
        console.log('Запит до API, що потребує бази даних:', req.path);

        next();
    } catch (error) {
        console.error('Middleware error:', error);
        next();
    }
});

const schoolRegistrationRouter = require('./routes/schoolRegistration');
const signupRouter = require('./routes/signup');
const statsRoutes = require('./routes/stats');
const loginRouter = require('./routes/login');
const userInfoRouter = require('./routes/userInfo');
const groupsRouter = require('./routes/groups');
const usersRouter = require('./routes/users');
const scheduleRouter = require('./routes/schedule');
const timeSlotsRouter = require('./routes/timetab');
const classroomsRoutes = require('./routes/classrooms');
const daysOfWeekRoutes = require('./routes/daysOfWeek');
const studyCalendar = require('./routes/studyCalendar');
const availableResourcesRoutes = require('./routes/availableResources');

console.log('Перевірка завантаження маршрутів...');

app.use('/api/school', schoolRegistrationRouter);
app.use('/api', signupRouter);
app.use('/api/stats', statsRoutes);
app.use('/api', loginRouter);
app.use('/api/user', userInfoRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/users', usersRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/time-slots', timeSlotsRouter);
app.use('/api/classrooms', classroomsRoutes);
app.use('/api/days', daysOfWeekRoutes);
app.use('/api/study-calendar', studyCalendar);
app.use('/api/available', availableResourcesRoutes);

console.log('Всі маршрути зареєстровано!');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.json({
        message: 'Сервер системи електронного щоденника працює!',
        version: '1.0.0',
        architecture: 'Multi-tenant without main database',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/debug', (req, res) => {
    res.json({
        message: 'API працює!',
        architecture: 'Multi-tenant with separate databases',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/system/info', (req, res) => {
    res.json({
        system: 'School Management System',
        multiTenant: true,
        architecture: 'Separate databases per school',
        features: [
            'No main database',
            'School registration creates separate DB',
            'All data stored in school databases',
            'File-based school registry'
        ]
    });
});

app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
        console.log('API маршрут не знайдено:', req.url);
        return res.status(404).json({
            error: 'API маршрут не знайдено',
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    res.status(404).json({
        error: 'Маршрут не знайдено',
        url: req.url,
        method: req.method
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Внутрішня помилка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\nServer is running on http://localhost:${PORT}`);
    console.log('\nДоступні API маршрути:');
    console.log('  GET    /api/debug');
    console.log('  GET    /api/system/info');
    console.log('  GET    /api/school/check-school');
    console.log('  POST   /api/school/register');
    console.log('  POST   /api/login');
    console.log('Сервер готовий до роботи!\n');
});