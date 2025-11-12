const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const School = require('../models/School');
const { getSchoolUserModel, getSchoolDBConnection } = require('../config/databaseManager');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login attempt for email:', email);

        const school = await School.findOne({
            adminEmail: email,
            isActive: true
        });

        if (!school) {
            return res.status(400).json({ error: 'Користувач не знайдений' });
        }

        const SchoolUser = getSchoolUserModel(school.databaseName);

        const user = await SchoolUser.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'Користувач не знайдений' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Невірний пароль' });
        }

        const hasData = await checkSchoolHasData(school.databaseName);

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
                schoolId: school._id,
                databaseName: school.databaseName,
                schoolName: getSchoolFullName(school),
                hasData: hasData
            }
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

        return hasOtherUsers || hasGroups || hasSubjects;

    } catch (error) {
        console.error('Error checking school data:', error);
        return false;
    }
}

// ФУНКЦІЯ ДЛЯ ФОРМУВАННЯ ПОВНОЇ НАЗВИ НАЧАЛЬНОГО ЗАКЛАДУ
function getSchoolFullName(school) {
    const typeNames = {
        school: 'Школа',
        gymnasium: 'Гімназія',
        lyceum: 'Ліцей',
        college: 'Коледж',
        university: 'Університет'
    };

    let fullName = typeNames[school.institutionType];
    if (school.number) fullName += ` №${school.number}`;
    if (school.name) fullName += ` ${school.name}`;
    if (school.honoraryName) fullName += ` імені ${school.honoraryName}`;
    return fullName;
}

module.exports = router;