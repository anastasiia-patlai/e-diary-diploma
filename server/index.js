const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/db-e-diary')
    .then(() => console.log('MongoDB підключено'))
    .catch(err => console.error('Помилка підключення до MongoDB:', err));

const signupRouter = require('./routes/signup');
const groupsRouter = require('./routes/groups');
const loginRouter = require('./routes/login');

app.use('/api', signupRouter);
app.use('/api/groups', groupsRouter);
app.use('/api', loginRouter);

app.get('/', (req, res) => res.send('Сервер працює!'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
