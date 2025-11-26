const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getSchoolUserModel, getSchoolDBConnection, getSchools, getSchoolModel } = require('../config/databaseManager');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login attempt for email:', email);

        const schools = await getSchools();

        if (schools.length === 0) {
            return res.status(400).json({ error: 'Жодного навчального закладу не зареєстровано' });
        }

        let user = null;
        let schoolInfo = null;
        let schoolDbName = null;

        for (const school of schools) {
            try {
                const SchoolUser = getSchoolUserModel(school.databaseName);
                const foundUser = await SchoolUser.findOne({ email });

                if (foundUser) {
                    user = foundUser;
                    schoolDbName = school.databaseName;

                    const School = getSchoolModel(schoolDbName);
                    const schoolRecord = await School.findOne({ databaseName: schoolDbName });
                    schoolInfo = schoolRecord;

                    break;
                }
            } catch (error) {
                console.error(`Error searching in ${school.databaseName}:`, error);
                continue;
            }
        }

        if (!user) {
            return res.status(400).json({ error: 'Користувач не знайдений' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Невірний пароль' });
        }

        const hasData = await checkSchoolHasData(schoolDbName);

        const userInfoForStorage = {
            userId: user._id.toString(),
            databaseName: schoolDbName,
            fullName: user.fullName,
            role: user.role,
            email: user.email,
            phone: user.phone,
            position: user.position,
            positions: user.positions || []
        };

        console.log('Дані для збереження в localStorage:', userInfoForStorage);

        res.json({
            message: 'Успішний вхід',
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                email: user.email,
                group: user.group || null,
                position: user.position || null,
                databaseName: schoolDbName,
                schoolName: getSchoolFullName(schoolInfo),
                hasData: hasData
            },
            localStorageData: userInfoForStorage
        });

    } catch (err) {
        console.error('Помилка при логіні:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

// ФУНКЦІЯ ДЛЯ ПЕРЕВІРКИ НАЯВНОСТІ ДАНИХ У НАВЧАЛЬНОМУ ЗАКЛАДІ
async function checkSchoolHasData(databaseName) {
    try {
        const connection = getSchoolDBConnection(databaseName);

        const UserModel = connection.model('User');
        const GroupModel = connection.model('Group');

        const usersCount = await UserModel.countDocuments();
        const hasOtherUsers = usersCount > 1;

        const groupsCount = await GroupModel.countDocuments();
        const hasGroups = groupsCount > 0;

        let hasSubjects = false;
        try {
            const SubjectModel = connection.model('Subject');
            const subjectsCount = await SubjectModel.countDocuments();
            hasSubjects = subjectsCount > 0;
        } catch (e) {
            console.log('Subject model not found');
        }

        let hasClassrooms = false;
        try {
            const ClassroomModel = connection.model('Classroom');
            const classroomsCount = await ClassroomModel.countDocuments();
            hasClassrooms = classroomsCount > 0;
        } catch (e) {
            console.log('Classroom model not found');
        }

        let hasSchedule = false;
        try {
            const ScheduleModel = connection.model('Schedule');
            const scheduleCount = await ScheduleModel.countDocuments();
            hasSchedule = scheduleCount > 0;
        } catch (e) {
            console.log('Schedule model not found');
        }

        return hasOtherUsers || hasGroups || hasSubjects || hasClassrooms || hasSchedule;

    } catch (error) {
        console.error('Error checking school data:', error);
        return false;
    }
}

// ФУНКЦІЯ ДЛЯ ФОРМУВАННЯ ПОВНОЇ НАЗВИ НАВЧАЛЬНОГО ЗАКЛАДУ
function getSchoolFullName(school) {
    if (!school) return 'Навчальний заклад';

    const typeNames = {
        school: 'Школа',
        gymnasium: 'Гімназія',
        lyceum: 'Ліцей',
        college: 'Коледж',
        university: 'Університет'
    };

    let fullName = typeNames[school.institutionType] || 'Навчальний заклад';

    if (school.number && ['school', 'gymnasium', 'lyceum'].includes(school.institutionType)) {
        fullName += ` №${school.number}`;
    }

    if (school.name && ['gymnasium', 'lyceum', 'college', 'university'].includes(school.institutionType)) {
        fullName += ` ${school.name}`;
    }

    if (school.honoraryName) {
        fullName += ` імені ${school.honoraryName}`;
    }

    return fullName;
}

// ДОДАЄМО МАРШРУТ ДЛЯ ПЕРЕВІРКИ ДОСТУПНОСТІ БАЗИ ДАНИХ
router.get('/check-db/:databaseName', async (req, res) => {
    try {
        const { databaseName } = req.params;

        const SchoolUser = getSchoolUserModel(databaseName);
        const usersCount = await SchoolUser.countDocuments();

        res.json({
            status: 'OK',
            databaseName: databaseName,
            usersCount: usersCount
        });
    } catch (error) {
        console.error('Database check failed:', error);
        res.status(500).json({
            status: 'ERROR',
            databaseName: req.params.databaseName,
            error: error.message
        });
    }
});

// МАРШРУТ ДЛЯ ОТРИМАННЯ ІНФОРМАЦІЇ ПРО ШКОЛУ
router.get('/school-info/:databaseName', async (req, res) => {
    try {
        const { databaseName } = req.params;

        const School = getSchoolModel(databaseName);
        const schoolInfo = await School.findOne({ databaseName: databaseName });

        if (!schoolInfo) {
            return res.status(404).json({ error: 'Інформацію про школу не знайдено' });
        }

        res.json({
            school: {
                institutionType: schoolInfo.institutionType,
                number: schoolInfo.number,
                name: schoolInfo.name,
                honoraryName: schoolInfo.honoraryName,
                city: schoolInfo.city,
                address: schoolInfo.address,
                fullName: getSchoolFullName(schoolInfo)
            }
        });
    } catch (error) {
        console.error('Error getting school info:', error);
        res.status(500).json({ error: 'Помилка при отриманні інформації про школу' });
    }
});

module.exports = router;