const mongoose = require('mongoose');

// Імпортуємо СХЕМИ, а не моделі
const userSchema = require('../models/User').schema;
const groupSchema = require('../models/Group').schema;
const classroomSchema = require('../models/Classroom').schema;
const dayOfWeekSchema = require('../models/DayOfWeek').schema;
const timeTabSchema = require('../models/TimeTab').schema;
const scheduleSchema = require('../models/Schedule').schema;

// ГОЛОВНЕ ПІДКЛЮЧЕННЯ ДО БАЗИ ДАНИХ ДЛЯ НАВЧАЛЬНИХ ЗАКЛАДІВ
const mainConnection = mongoose.createConnection(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_system_main');

// КОЛЕКЦІЯ З'ЄДНАННЬ ДЛЯ НАВЧАЛЬНИХ ЗАКЛАДІВ
const schoolConnections = new Map();

// ФУНКЦІЯ ДЛЯ СТВОРЕННЯ НОВОЇ БАЗИ ДАНИХ ШКОЛИ З ВСІМА МОДЕЛЯМИ
async function createDatabase(databaseName) {
    try {
        console.log(`Creating database: ${databaseName}`);

        const schoolDbURI = process.env.MONGODB_URI
            ? `${process.env.MONGODB_URI}/${databaseName}`
            : `mongodb://localhost:27017/${databaseName}`;

        const schoolConnection = mongoose.createConnection(schoolDbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Чекаємо на підключення
        await new Promise((resolve, reject) => {
            schoolConnection.on('connected', resolve);
            schoolConnection.on('error', reject);
        });

        console.log(`Connected to database: ${databaseName}`);

        // Реєструємо моделі з СХЕМАМИ
        schoolConnection.model('User', userSchema);
        schoolConnection.model('Group', groupSchema);
        schoolConnection.model('Classroom', classroomSchema);
        schoolConnection.model('DayOfWeek', dayOfWeekSchema);
        schoolConnection.model('TimeTab', timeTabSchema);
        schoolConnection.model('Schedule', scheduleSchema);

        console.log(`All models registered for database: ${databaseName}`);

        // Ініціалізуємо базові дані
        await initializeBaseData(schoolConnection);

        // Зберігаємо підключення
        schoolConnections.set(databaseName, schoolConnection);

        console.log(`Database ${databaseName} created successfully with ALL models`);
        return schoolConnection;
    } catch (error) {
        console.error(`Error creating database ${databaseName}:`, error);
        throw error;
    }
}

async function initializeBaseData(connection) {
    try {
        const DayOfWeek = connection.model('DayOfWeek');

        const daysCount = await DayOfWeek.countDocuments();
        if (daysCount === 0) {
            const daysOfWeek = [
                { id: 1, name: 'Понеділок', nameShort: 'Пн', order: 1 },
                { id: 2, name: 'Вівторок', nameShort: 'Вт', order: 2 },
                { id: 3, name: 'Середа', nameShort: 'Ср', order: 3 },
                { id: 4, name: 'Четвер', nameShort: 'Чт', order: 4 },
                { id: 5, name: 'П\'ятниця', nameShort: 'Пт', order: 5 },
                { id: 6, name: 'Субота', nameShort: 'Сб', order: 6 },
                { id: 7, name: 'Неділя', nameShort: 'Нд', order: 7 }
            ];

            await DayOfWeek.insertMany(daysOfWeek);
            console.log('Base data (days of week) initialized');
        }
    } catch (error) {
        console.error('Error initializing base data:', error);
    }
}

// ФУНКЦІЯ ДЛЯ ОТРИМАННЯ ПІДКЛЮЧЕННЯ ДО БАЗИ ДАНИХ НАВЧАЛЬНОГО ЗАКЛАДУ
function getSchoolDBConnection(databaseName) {
    let connection = schoolConnections.get(databaseName);

    if (!connection) {
        const schoolDbURI = process.env.MONGODB_URI
            ? `${process.env.MONGODB_URI}/${databaseName}`
            : `mongodb://localhost:27017/${databaseName}`;

        connection = mongoose.createConnection(schoolDbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Реєструємо моделі з СХЕМАМИ
        connection.model('User', userSchema);
        connection.model('Group', groupSchema);
        connection.model('Classroom', classroomSchema);
        connection.model('DayOfWeek', dayOfWeekSchema);
        connection.model('TimeTab', timeTabSchema);
        connection.model('Schedule', scheduleSchema);

        schoolConnections.set(databaseName, connection);
        console.log(`New connection created for database: ${databaseName}`);
    }

    return connection;
}

// ФУНКЦІЇ ДЛЯ ОТРИМАННЯ МОДЕЛЕЙ ПЕВНОГО НАВЧАЛЬНОГО ЗАКЛАДУ
function getSchoolUserModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('User');
}

function getSchoolGroupModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('Group');
}

function getSchoolClassroomModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('Classroom');
}

function getSchoolDayOfWeekModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('DayOfWeek');
}

function getSchoolTimeTabModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('TimeTab');
}

function getSchoolScheduleModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('Schedule');
}

// ФУНКЦІЯ ДЛЯ ПЕРЕВІРКИ НАЯВНОСТІ ДАНИХ У ШКОЛІ
async function checkSchoolHasData(databaseName) {
    try {
        const connection = getSchoolDBConnection(databaseName);

        const UserModel = connection.model('User');
        const GroupModel = connection.model('Group');
        const ClassroomModel = connection.model('Classroom');

        const usersCount = await UserModel.countDocuments();
        const hasOtherUsers = usersCount > 1;

        const groupsCount = await GroupModel.countDocuments();
        const hasGroups = groupsCount > 0;

        const classroomsCount = await ClassroomModel.countDocuments();
        const hasClassrooms = classroomsCount > 0;

        return hasOtherUsers || hasGroups || hasClassrooms;

    } catch (error) {
        console.error('Error checking school data:', error);
        return false;
    }
}

module.exports = {
    mainConnection,
    createDatabase,
    getSchoolDBConnection,
    getSchoolUserModel,
    getSchoolGroupModel,
    getSchoolClassroomModel,
    getSchoolDayOfWeekModel,
    getSchoolTimeTabModel,
    getSchoolScheduleModel,
    checkSchoolHasData,
    schoolConnections
};