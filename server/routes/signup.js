const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getSchoolUserModel, getSchoolGroupModel } = require('../config/databaseManager');

// ✅ ДОДАНО: REGEX для перевірки формату логіна на бекенді
const LOGIN_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+_[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+$/;

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
        jobPosition,
        teacherType,
        allowedCategories
    } = req.body;

    console.log("Перевірка полів:");
    console.log("- fullName:", fullName, "| Тип:", typeof fullName);
    console.log("- role:", role, "| Тип:", typeof role);
    console.log("- phone:", phone, "| Тип:", typeof phone);
    console.log("- email (логін):", email, "| Тип:", typeof email);
    console.log("- password:", password ? "присутній" : "відсутній");
    console.log("- teacherType:", teacherType, "| Для ролі:", role);

    try {
        if (!databaseName) {
            console.log("Відсутнє поле databaseName");
            return res.status(400).json({
                error: 'Не вказано databaseName. Система не може визначити школу.'
            });
        }

        console.log("Підключення до бази даних:", databaseName);

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

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

        // ✅ ДОДАНО: Перевірка формату логіна перед збереженням
        if (!LOGIN_REGEX.test(email)) {
            console.log("Некоректний формат логіна:", email);
            return res.status(400).json({
                error: "Логін має бути у форматі прізвище_ім'я (напр. ivanenko_ivan). Дозволені символи: латиниця та кирилиця."
            });
        }

        console.log("Перевірка існуючого користувача...");
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Користувач вже існує:", email);
            // ✅ ЗМІНЕНО: повідомлення "email" → "логін"
            return res.status(400).json({ error: 'Користувач з таким логіном вже існує' });
        }

        console.log("Хешування пароля...");
        const hashedPassword = await bcrypt.hash(password, 10);

        let groupId = null;

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

        if (role === 'student') {
            userData.group = groupId;
            console.log("Додано групу для студента:", groupId);
        } else if (role === 'teacher') {
            userData.positions = positions && Array.isArray(positions)
                ? positions.filter(pos => pos && pos.trim() !== "")
                : [];
            userData.position = userData.positions.join(", ");
            userData.category = category || '';

            if (!teacherType) {
                return res.status(400).json({
                    error: 'Для викладача обов\'язково вказати тип викладача'
                });
            }

            userData.teacherType = teacherType;

            if (teacherType === "young") {
                userData.allowedCategories = ["young"];
            } else if (teacherType === "middle") {
                userData.allowedCategories = ["middle"];
            } else if (teacherType === "senior") {
                userData.allowedCategories = ["senior"];
            } else if (teacherType === "middle-senior") {
                userData.allowedCategories = ["middle", "senior"];
            } else if (teacherType === "all") {
                userData.allowedCategories = ["young", "middle", "senior"];
            } else {
                userData.allowedCategories = [];
            }

            console.log("Додано тип викладача:", userData.teacherType);
            console.log("Додано дозволені категорії:", userData.allowedCategories);

            if (category && category.trim() !== "") {
                userData.category = category;
            } else {
                userData.category = "Без категорії";
            }

            console.log("Додано позиції для викладача:", userData.positions);
        } else if (role === 'admin') {
            userData.jobPosition = jobPosition || '';
            console.log("Додано посаду для адміна:", userData.jobPosition);
        }

        console.log("Дані для створення користувача:", JSON.stringify(userData, null, 2));

        console.log("Створення нового користувача...");
        const newUser = new User(userData);
        await newUser.save();
        console.log("Користувач успішно створений:", newUser._id);

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
                category: newUser.category,
                teacherType: newUser.teacherType
            }
        });

    } catch (err) {
        console.error("=== ПОМИЛКА РЕЄСТРАЦІЇ ===");
        console.error("Тип помилки:", err.name);
        console.error("Повідомлення:", err.message);
        console.error("Стек:", err.stack);

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
            return res.status(400).json({
                error: 'Некоректний формат даних',
                details: err.message
            });
        }

        if (err.code === 11000) {
            // ✅ ЗМІНЕНО: повідомлення "email" → "логін"
            return res.status(400).json({
                error: 'Користувач з таким логіном вже існує'
            });
        }

        if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
            return res.status(500).json({
                error: 'Не вдалося підключитися до бази даних школи',
                details: 'Перевірте, чи MongoDB сервер запущено'
            });
        }

        res.status(500).json({
            error: 'Внутрішня помилка сервера',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Зверніться до адміністратора'
        });
    }
});

module.exports = router;