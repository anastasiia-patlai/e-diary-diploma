const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { createDatabase, getSchoolUserModel, getSchools, schoolExists } = require('../config/databaseManager');

console.log('School registration routes loaded!');

// ФУНКЦІЯ ДЛЯ ТРАНСЛІТЕРАЦІЇ ТА ФОРМУВАННЯ ІМЕНІ БАЗИ ДАНИХ
function transliterate(text) {
    const ukrainianToLatin = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g',
        'д': 'd', 'е': 'e', 'є': 'ie', 'ж': 'zh', 'з': 'z',
        'и': 'y', 'і': 'i', 'ї': 'i', 'й': 'i', 'к': 'k',
        'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
        'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
        'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ь': '', 'ю': 'iu', 'я': 'ia',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G',
        'Д': 'D', 'Е': 'E', 'Є': 'Ie', 'Ж': 'Zh', 'З': 'Z',
        'И': 'Y', 'І': 'I', 'Ї': 'I', 'Й': 'I', 'К': 'K',
        'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
        'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
        'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
        'Ь': '', 'Ю': 'Iu', 'Я': 'Ia',
        "'": '', '"': '', '`': '', '~': '', '!': '', '@': '',
        '#': '', '$': '', '%': '', '^': '', '&': '', '*': '',
        '(': '', ')': '', '=': '', '+': '', '[': '', ']': '',
        '{': '', '}': '', '|': '', '\\': '', '/': '', ':': '',
        ';': '', '<': '', '>': '', ',': '', '.': '', '?': ''
    };

    return text
        .split('')
        .map(char => ukrainianToLatin[char] || char)
        .join('')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();
}

// ПЕРЕВІРИТИ ЧИ ІСНУЄ ШКОЛА
router.get('/check-school', async (req, res) => {
    try {
        console.log('Checking if school exists...');
        const schools = await getSchools();
        console.log(`Schools found: ${schools.length}`);
        res.json({
            hasSchool: schools.length > 0,
            count: schools.length
        });
    } catch (error) {
        console.error('Error checking school:', error);
        res.status(500).json({
            message: 'Помилка при перевірці школи',
            error: error.message
        });
    }
});

// ЗАРЕЄСТРУВАТИ ШКОЛУ
router.post('/register', async (req, res) => {
    let schoolDbConnection = null;

    try {
        console.log('SCHOOL REGISTRATION START');
        console.log('1. Request body received:', JSON.stringify(req.body, null, 2));

        const {
            institutionType,
            number,
            name,
            honoraryName,
            city,
            address,
            adminFullName,
            adminPosition,
            adminEmail,
            adminPhone,
            adminPassword
        } = req.body;

        console.log('2. Validating required fields...');
        if (!institutionType || !city || !address) {
            console.log('Missing basic fields');
            return res.status(400).json({
                message: 'Тип закладу, місто та адреса обов\'язкові'
            });
        }

        if (!adminFullName || !adminPosition || !adminEmail || !adminPhone || !adminPassword) {
            console.log('Missing admin fields');
            return res.status(400).json({
                message: 'Всі поля адміністратора обов\'язкові для заповнення'
            });
        }
        console.log('All required fields present');

        console.log('3. Checking if school already exists...');
        const schools = await getSchools();
        if (schools.length > 0) {
            console.log('School already exists');
            return res.status(400).json({
                message: 'Навчальний заклад вже зареєстрований в системі'
            });
        }
        console.log('No existing school found');

        console.log('4. Validating institution type specific fields...');
        if (['school', 'gymnasium', 'lyceum'].includes(institutionType) && !number) {
            console.log('Missing number for', institutionType);
            return res.status(400).json({
                message: 'Для обраного типу закладу номер є обов\'язковим'
            });
        }
        console.log('Institution type validation passed');

        console.log('5. Generating database name...');
        const databaseName = generateDatabaseName(
            institutionType,
            number,
            name,
            honoraryName,
            city
        );

        console.log('Database name generated:', databaseName);

        console.log('6. Checking for duplicate database name...');
        const dbExists = await schoolExists(databaseName);
        if (dbExists) {
            console.log('Database already exists:', databaseName);
            return res.status(400).json({
                message: 'База даних з такою назвою вже існує'
            });
        }
        console.log('Database name is unique');

        console.log('7. Hashing password...');
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        console.log('Password hashed successfully');

        console.log('8. Creating database and school record...');

        // Підготуємо дані для школи
        const schoolData = {
            institutionType,
            number: number || undefined,
            name: name || undefined,
            honoraryName: honoraryName || undefined,
            city,
            address,
            databaseName,
            adminFullName,
            adminPosition,
            adminEmail,
            adminPhone,
            adminPassword: hashedPassword
        };

        schoolDbConnection = await createDatabase(databaseName, schoolData);
        console.log('Database created successfully');

        console.log('9. Getting SchoolUser model...');
        const SchoolUser = getSchoolUserModel(databaseName);
        console.log('SchoolUser model obtained');

        console.log('10. Creating admin user...');
        const adminUser = new SchoolUser({
            fullName: adminFullName,
            role: 'admin',
            phone: adminPhone,
            email: adminEmail,
            password: hashedPassword,
            positions: [adminPosition],
            position: adminPosition
        });

        await adminUser.save();
        console.log('Admin user created with ID:', adminUser._id);

        console.log('11. Updating school record with admin user ID...');
        const School = schoolDbConnection.model('School');
        await School.findOneAndUpdate(
            { databaseName },
            { adminUserId: adminUser._id }
        );
        console.log('School record updated with admin user ID');

        console.log('SCHOOL REGISTRATION SUCCESS');

        res.status(201).json({
            message: 'Навчальний заклад успішно зареєстровано',
            school: {
                institutionType,
                fullName: getInstitutionFullName(institutionType, number, name, honoraryName),
                city,
                address,
                databaseName,
                adminFullName,
                adminPosition,
                adminEmail
            }
        });

    } catch (error) {
        console.error('Error registering school:', error);
        console.error('Error stack:', error.stack);

        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Навчальний заклад з такими даними вже існує'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Помилка валідації даних',
                errors: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }

        res.status(500).json({
            message: 'Помилка при реєстрації навчального закладу',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Внутрішня помилка сервера',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

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

    if (name) {
        fullName += ` ${name}`;
    }

    if (honoraryName) {
        fullName += ` імені ${honoraryName}`;
    }

    return fullName;
}

function generateDatabaseName(institutionType, number, name, honoraryName, city) {
    const typePrefix = {
        school: 'school',
        gymnasium: 'gymnasium',
        lyceum: 'lyceum',
        college: 'college',
        university: 'university'
    };

    const cleanCity = transliterate(city);

    let dbName = `${typePrefix[institutionType]}_${cleanCity}`;

    if (number) {
        const cleanNumber = number.toString().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
        if (cleanNumber) {
            dbName += `_${cleanNumber}`;
        }
    }

    if (name) {
        const cleanName = transliterate(name);
        if (cleanName) {
            dbName += `_${cleanName}`;
        }
    }

    if (honoraryName) {
        const cleanHonorary = transliterate(honoraryName);
        if (cleanHonorary) {
            dbName += `_${cleanHonorary}`;
        }
    }

    const maxLength = 50;
    if (dbName.length > maxLength) {
        dbName = dbName.substring(0, maxLength);
    }

    dbName = dbName.replace(/_+$/, '');

    dbName += '_' + Date.now().toString().slice(-6);

    console.log('Database name generated:', dbName);

    return dbName;
}

module.exports = router;