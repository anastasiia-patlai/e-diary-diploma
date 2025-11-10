const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ЛОГУВАННЯ ВСІХ ЗАПИТІВ
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

mongoose.connect('mongodb://localhost:27017/db-e-diary')
    .then(() => console.log('MongoDB підключено'))
    .catch(err => console.error('Помилка підключення MongoDB:', err));

const signupRouter = require('./routes/signup');
const statsRoutes = require('./routes/stats');
const loginRouter = require('./routes/login');
const groupsRouter = require('./routes/groups');
const usersRouter = require('./routes/users');
const scheduleRouter = require('./routes/schedule');
const timeSlotsRouter = require('./routes/timetab');
const classroomsRoutes = require('./routes/classrooms');
const daysOfWeekRoutes = require('./routes/daysOfWeek');
const availableResourcesRoutes = require('./routes/availableResources');

console.log('🔍 Перевірка завантаження маршрутів...');

// РЕЄСТРАЦІЯ МАРШРУТІВ
app.use('/api', signupRouter);
app.use('/api/stats', statsRoutes);
app.use('/api', loginRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/users', usersRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/time-slots', timeSlotsRouter);
app.use('/api/classrooms', classroomsRoutes);
app.use('/api/days', daysOfWeekRoutes);
app.use('/api/available', availableResourcesRoutes);

console.log('✅ Всі маршрути зареєстровано!');

// Статичні файли
app.use(express.static('public'));

// СТАРТ
app.get('/', (req, res) => {
    res.send('Сервер працює!');
});

// ТЕСТОВІ РОУТИ
app.get('/api/debug', (req, res) => {
    res.json({
        message: 'API працює!',
        timestamp: new Date().toISOString()
    });
});

// УНІВЕРСАЛЬНИЙ 404 - ПРОСТИЙ ВАРІАНТ
app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
        console.log('❌ API маршрут не знайдено:', req.url);
        return res.status(404).json({
            error: 'API маршрут не знайдено',
            url: req.url,
            method: req.method
        });
    }

    // Для не-API запитів
    res.status(404).json({
        error: 'Маршрут не знайдено',
        url: req.url,
        method: req.method
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log('\n📋 Доступні API маршрути:');
    console.log('  GET    /api/debug');
    console.log('  GET    /api/available/test');
    console.log('  GET    /api/available/classrooms');
    console.log('  GET    /api/available/teachers');
    console.log('  GET    /api/available/check-availability');
    console.log('\n✅ Сервер готовий до роботи!\n');
});