const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ПІДКЛЮЧЕННЯ ДО ГОЛОВНОЇ БАЗИ ДАНИХ
mongoose.connect('mongodb://localhost:27017/school_system_main')
    .then(() => console.log('MongoDB підключено до головної бази даних'))
    .catch(err => console.error('Помилка підключення MongoDB:', err));

const { mainConnection } = require('./config/databaseManager');

app.use(async (req, res, next) => {
    try {
        if (req.path === '/api/school/check-school' || req.path === '/api/school/register') {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            console.log('Authenticated request');
        }

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
        timestamp: new Date().toISOString()
    });
});

app.get('/api/debug', (req, res) => {
    res.json({
        message: 'API працює!',
        database: 'school_system_main',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/system/info', (req, res) => {
    res.json({
        system: 'School Management System',
        multiTenant: true,
        mainDatabase: 'school_system_main',
        features: [
            'Multi-database architecture',
            'School registration',
            'User management',
            'Schedule management',
            'Classroom management'
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
    console.log('  GET    /api/available/test');
    console.log('  GET    /api/available/classrooms');
    console.log('  GET    /api/available/teachers');
    console.log('  GET    /api/available/check-availability');
    console.log('\nСервер готовий до роботи!\n');
});