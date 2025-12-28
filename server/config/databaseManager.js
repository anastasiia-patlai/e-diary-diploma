const mongoose = require('mongoose');

const userSchema = require('../models/User').schema;
const groupSchema = require('../models/Group').schema;
const classroomSchema = require('../models/Classroom').schema;
const dayOfWeekSchema = require('../models/DayOfWeek').schema;
const timeTabSchema = require('../models/TimeTab').schema;
const scheduleSchema = require('../models/Schedule').schema;
const schoolSchema = require('../models/School').schema;
const semesterSchema = require('../models/Semester').schema;
const quarterSchema = require('../models/Quarter').schema;
const holidaySchema = require('../models/Holiday').schema;

// ФАЙЛ ДЛЯ ЗБЕРІГАННЯ ІНФОРМАЦІЇ ПРО ШКОЛИ
const fs = require('fs').promises;
const path = require('path');
const SCHOOLS_FILE = path.join(__dirname, 'schools.json');

// КОЛЕКЦІЯ З'ЄДНАНЬ ДЛЯ НАВЧАЛЬНИХ ЗАКЛАДІВ
const schoolConnections = new Map();

// ФУНКЦІЇ ДЛЯ РОБОТИ З ФАЙЛОМ ШКІЛ
async function loadSchools() {
    try {
        const data = await fs.readFile(SCHOOLS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveSchools(schools) {
    await fs.writeFile(SCHOOLS_FILE, JSON.stringify(schools, null, 2));
}

async function addSchool(schoolInfo) {
    const schools = await loadSchools();
    schools.push(schoolInfo);
    await saveSchools(schools);
}

async function getSchools() {
    return await loadSchools();
}

async function getSchoolByDatabaseName(databaseName) {
    const schools = await loadSchools();
    return schools.find(school => school.databaseName === databaseName);
}

async function schoolExists(databaseName) {
    const schools = await loadSchools();
    return schools.some(school => school.databaseName === databaseName);
}

// ФУНКЦІЯ ДЛЯ СТВОРЕННЯ НОВОЇ БАЗИ ДАНИХ ШКОЛИ
async function createDatabase(databaseName, schoolData) {
    try {
        console.log(`Creating database: ${databaseName}`);

        const schoolDbURI = process.env.MONGODB_URI
            ? `${process.env.MONGODB_URI}/${databaseName}`
            : `mongodb://localhost:27017/${databaseName}`;

        const schoolConnection = mongoose.createConnection(schoolDbURI);

        await new Promise((resolve, reject) => {
            schoolConnection.on('connected', resolve);
            schoolConnection.on('error', reject);
        });

        console.log(`Connected to database: ${databaseName}`);

        schoolConnection.model('User', userSchema);
        schoolConnection.model('Group', groupSchema);
        schoolConnection.model('Classroom', classroomSchema);
        schoolConnection.model('DayOfWeek', dayOfWeekSchema);
        schoolConnection.model('TimeTab', timeTabSchema);
        schoolConnection.model('Schedule', scheduleSchema);
        schoolConnection.model('School', schoolSchema);
        schoolConnection.model('Semester', semesterSchema);
        schoolConnection.model('Quarter', quarterSchema);
        schoolConnection.model('Holiday', holidaySchema);

        console.log(`All models registered for database: ${databaseName}`);

        await addSchool({
            databaseName: databaseName,
            institutionType: schoolData.institutionType,
            city: schoolData.city,
            fullName: getInstitutionFullName(
                schoolData.institutionType,
                schoolData.number,
                schoolData.name,
                schoolData.honoraryName
            ),
            createdAt: new Date().toISOString()
        });

        await initializeBaseData(schoolConnection);

        const School = schoolConnection.model('School');
        const schoolRecord = new School(schoolData);
        await schoolRecord.save();

        schoolConnections.set(databaseName, schoolConnection);

        console.log(`Database ${databaseName} created successfully with ALL models and school record`);
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

function getInstitutionFullName(type, number, name, honoraryName) {
    const typeNames = {
        school: 'Школа',
        gymnasium: 'Гімназія',
        lyceum: 'Ліцей',
        college: 'Коледж',
        university: 'Університет'
    };

    let fullName = typeNames[type] || type;

    if (number && ['school', 'gymnasium', 'lyceum'].includes(type)) {
        fullName += ` №${number}`;
    }

    if (name && ['gymnasium', 'lyceum', 'college', 'university'].includes(type)) {
        fullName += ` ${name}`;
    }

    if (honoraryName) {
        fullName += ` імені ${honoraryName}`;
    }

    return fullName;
}

// ФУНКЦІЯ ДЛЯ ОТРИМАННЯ ПІДКЛЮЧЕННЯ ДО БАЗИ ДАНИХ НАВЧАЛЬНОГО ЗАКЛАДУ
function getSchoolDBConnection(databaseName) {
    let connection = schoolConnections.get(databaseName);

    if (!connection) {
        const schoolDbURI = process.env.MONGODB_URI
            ? `${process.env.MONGODB_URI}/${databaseName}`
            : `mongodb://localhost:27017/${databaseName}`;

        connection = mongoose.createConnection(schoolDbURI);

        connection.model('User', userSchema);
        connection.model('Group', groupSchema);
        connection.model('Classroom', classroomSchema);
        connection.model('DayOfWeek', dayOfWeekSchema);
        connection.model('TimeTab', timeTabSchema);
        connection.model('Schedule', scheduleSchema);
        connection.model('School', schoolSchema);
        connection.model('Semester', semesterSchema);
        connection.model('Quarter', quarterSchema);
        connection.model('Holiday', holidaySchema);

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

function getSchoolModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('School');
}

function getSchoolSemesterModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('Semester');
}

function getSchoolQuarterModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('Quarter');
}

function getSchoolHolidayModel(databaseName) {
    const connection = getSchoolDBConnection(databaseName);
    return connection.model('Holiday');
}

module.exports = {
    createDatabase,
    getSchoolDBConnection,
    getSchoolUserModel,
    getSchoolGroupModel,
    getSchoolClassroomModel,
    getSchoolDayOfWeekModel,
    getSchoolTimeTabModel,
    getSchoolScheduleModel,
    getSchoolModel,
    getSchoolSemesterModel,
    getSchoolQuarterModel,
    getSchoolHolidayModel,
    schoolConnections,
    loadSchools,
    getSchools,
    getSchoolByDatabaseName,
    schoolExists
};