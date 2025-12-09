const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getSchoolUserModel, getSchoolGroupModel } = require('../config/databaseManager');

router.post('/signup', async (req, res) => {
    console.log("Отримані дані:", JSON.stringify(req.body, null, 2));

    const {
        databaseName,
        fullName,
        role,
        phone,
        dateOfBirth,
        email,
        password,
        group,
        positions,
        category,
        jobPosition
    } = req.body;

    try {
        // Перевірка наявності databaseName
        if (!databaseName) {
            console.log("Відсутнє поле databaseName");
            return res.status(400).json({
                error: 'Не вказано databaseName. Система не може визначити школу.'
            });
        }

        console.log("Підключення до бази даних:", databaseName);

        // Отримуємо моделі для конкретної школи
        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

        // Перевірка обов'язкових полів
        if (!fullName || !role || !phone || !email || !password) {
            console.log("Відсутні обов'язкові поля");
            return res.status(400).json({
                error: 'Всі обов\'язкові поля повинні бути заповнені',
                missingFields: {
                    fullName: !fullName,
                    role: !role,
                    phone: !phone,
                    email: !email,
                    password: !password
                }
            });
        }

        console.log("Перевірка існуючого користувача...");
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Користувач вже існує:", email);
            return res.status(400).json({ error: 'Користувач з таким email вже існує' });
        }

        console.log("Хешування пароля...");
        const hashedPassword = await bcrypt.hash(password, 10);

        let groupId = null;

        // Обробка групи для студентів
        if (role === 'student' && group) {
            console.log("Обробка групи для студента:", group);
            let existingGroup = await Group.findOne({ name: group });

            if (!existingGroup) {
                console.log("Створення нової групи:", group);
                existingGroup = new Group({ name: group, students: [] });
                await existingGroup.save();
            }

            groupId = existingGroup._id;
        }

        const userData = {
            fullName,
            role,
            phone,
            dateOfBirth: dateOfBirth || null,
            email,
            password: hashedPassword
        };

        // Додаткові поля за роллю
        if (role === 'student') {
            userData.group = groupId;
            console.log("Додано групу для студента:", groupId);
        } else if (role === 'teacher') {
            userData.positions = positions && Array.isArray(positions)
                ? positions.filter(pos => pos && pos.trim() !== "")
                : [];
            userData.position = userData.positions.join(", ");
            userData.category = category || '';
            userData.teacherType = teacherType || '';
            userData.allowedCategories = allowedCategories || [];

            console.log("Додано тип викладача:", userData.teacherType);
            console.log("Додано дозволені категорії:", userData.allowedCategories);

            if (category && category.trim() !== "") {
                userData.category = category;
                console.log("Додано категорію для викладача:", userData.category);
            } else {
                userData.category = "Без категорії";
                console.log("Встановлено категорію за замовчуванням:", userData.category);
            }

            console.log("Додано позиції для викладача:", userData.positions);
        } else if (role === 'admin') {
            userData.jobPosition = jobPosition || '';
            console.log("Додано посаду для адміна:", userData.jobPosition);
        }

        console.log("Дані для створення користувача:", userData);

        // Створення користувача
        console.log("Створення нового користувача...");
        const newUser = new User(userData);
        await newUser.save();
        console.log("Користувач успішно створений:", newUser._id);

        // Оновлення групи для студентів
        if (role === 'student' && groupId) {
            console.log("Оновлення групи з студентом...");
            await Group.findByIdAndUpdate(
                groupId,
                { $addToSet: { students: newUser._id } }
            );
        }

        console.log("=== РЕЄСТРАЦІЯ УСПІШНА ===");
        res.status(201).json({
            message: 'Користувача успішно зареєстровано',
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                role: newUser.role,
                email: newUser.email,
                category: newUser.category
            }
        });

    } catch (err) {
        console.error("=== ПОМИЛКА РЕЄСТРАЦІЇ ===");
        console.error("Тип помилки:", err.name);
        console.error("Повідомлення:", err.message);
        console.error("Стек:", err.stack);

        // Детальна обробка різних типів помилок
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => ({
                field: error.path,
                message: error.message
            }));
            console.error("Помилки валідації:", errors);
            return res.status(400).json({
                error: 'Помилка валідації даних',
                details: errors
            });
        }

        if (err.name === 'CastError') {
            console.error("Помилка приведення типу:", err);
            return res.status(400).json({
                error: 'Некоректний формат даних',
                details: err.message
            });
        }

        if (err.code === 11000) {
            console.error("Duplicate key error:", err);
            return res.status(400).json({
                error: 'Користувач з таким email вже існує'
            });
        }

        if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
            console.error("Timeout при підключенні до бази даних");
            return res.status(500).json({
                error: 'Не вдалося підключитися до бази даних школи',
                details: 'Перевірте, чи MongoDB сервер запущено'
            });
        }

        // Загальна помилка сервера
        console.error("Неочікувана помилка:", err);
        res.status(500).json({
            error: 'Внутрішня помилка сервера',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Зверніться до адміністратора'
        });
    }
});

module.exports = router;