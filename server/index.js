const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ЛЛОГУВАННЯ ВСІХ ЗАПИТІВ
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

console.log('Реєстрація роутів...');
app.use('/api', signupRouter);
app.use('/api/stats', statsRoutes);
app.use('/api', loginRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/users', usersRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/time-slots', timeSlotsRouter);
app.use('/api/classrooms', classroomsRoutes);

console.log('Роути зареєстровано!');

// СТАРТ
app.get('/', (req, res) => {
    res.send('Сервер працює!');
});

// ТЕСТ
app.get('/api/test', (req, res) => {
    res.json({ message: 'API працює!' });
});

// 404
app.use((req, res) => {
    console.log('❌ 404 Not Found:', req.method, req.url);
    res.status(404).json({
        error: 'Маршрут не знайдено',
        requestedUrl: req.url,
        method: req.method
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('\nДоступні роути:');
    console.log('  POST   /api/signup');
    console.log('  POST   /api/login');
    console.log('  GET    /api/groups');
    console.log('  POST   /api/groups');
    console.log('  GET    /api/users/teachers');
    console.log('  GET    /api/users/:id');
    console.log('  PUT    /api/users/:id');
    console.log('  DELETE /api/users/:id');
    console.log('  GET    /api/test (тестовий роут)');
    console.log('\nСервер готовий до роботи!\n');
});

module.exports = app;