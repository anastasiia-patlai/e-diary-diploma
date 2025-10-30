const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const User = require('./models/User'); // імпорт схеми КОРИСТУВАЧА
const Group = require('./models/Group'); // імпорт схеми ГРУПИ

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/db-e-diary')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// РЕЄСТРАЦІЯ КОРИСТУВАЧА
app.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password, role, groupName, phone, position } = req.body;

        if (!fullName || !email || !password || !role || !phone) {
            return res.status(400).json({ error: "Заповніть всі обов'язкові поля" });
        }

        const user = new User({ fullName, email, password, role, phone });

        if (role === 'student') {
            if (!groupName) return res.status(400).json({ error: "Вкажіть групу" });

            let group = await Group.findOne({ name: groupName });

            if (!group) {
                group = new Group({ name: groupName, students: [] });
                await group.save();
            }

            user.group = group._id;
            await user.save();

            group.students.push(user._id);
            await group.save();
        } else if (role === 'teacher') {
            user.position = position || "";
            await user.save();
        } else {
            await user.save();
        }

        res.status(201).json({ message: `Користувач ${fullName} створений`, user });

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// СТВОРЕННЯ ГРУПИ
app.post('/api/groups', async (req, res) => {
    try {
        const { name, curator } = req.body;

        const group = new Group({
            name,
            curator: curator || null
        });

        await group.save();
        res.status(201).json({ message: `Група ${name} створена`, group });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
