const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    nameEn: { type: String, trim: true }, // Англійська назва
    capacity: { type: Number, required: true, min: 1, max: 500 },
    type: { type: String, enum: ['lecture', 'practice', 'lab', 'general'], default: 'general' },
    equipment: [{ type: String }],
    equipmentEn: [{ type: String }], // Англійське обладнання
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    description: { type: String, maxlength: 500 }
}, { timestamps: true });

// Словник для перекладу назв аудиторій
const roomNamesTranslations = {
    // Цифри
    '101': '101', '102': '102', '103': '103', '104': '104', '105': '105',
    '106': '106', '107': '107', '108': '108', '109': '109', '110': '110',
    '201': '201', '202': '202', '203': '203', '204': '204', '205': '205',
    '206': '206', '207': '207', '208': '208', '209': '209', '210': '210',
    '301': '301', '302': '302', '303': '303', '304': '304', '305': '305',
    // Спеціальні назви
    'Актовий зал': 'Assembly Hall',
    'Спортивна зала': 'Gym',
    'Бібліотека': 'Library',
    'Комп\'ютерний клас': 'Computer Lab',
    'Лабораторія': 'Laboratory',
    'Майстерня': 'Workshop',
    'Кабінет директора': "Principal's Office",
    'Вчительська': "Teachers' Room",
    'Медпункт': 'Medical Room',
    'Їдальня': 'Canteen',
    'Спортзал': 'Gym',
    'Актова зала': 'Assembly Hall',
    'Конференц-зал': 'Conference Hall'
};

// Словник для перекладу обладнання
const equipmentTranslations = {
    'проектор': 'projector',
    'комп\'ютери': 'computers',
    'мікроскопи': 'microscopes',
    'дошка': 'blackboard',
    'інтерактивна дошка': 'interactive whiteboard',
    'ноутбуки': 'laptops',
    'планшети': 'tablets',
    'лабораторне обладнання': 'laboratory equipment',
    'спортивний інвентар': 'sports equipment',
    'музичні інструменти': 'musical instruments',
    'телевізор': 'TV',
    'колонки': 'speakers',
    'кондиціонер': 'air conditioner',
    'шафи': 'cabinets',
    'парти': 'desks',
    'стільці': 'chairs',
    'монітор': 'monitor',
    'клавіатура': 'keyboard',
    'миша': 'mouse',
    'принтер': 'printer',
    'сканер': 'scanner',
    'роутер': 'router',
    'відеокамера': 'video camera',
    'мікрофон': 'microphone',
    'навушники': 'headphones',
    'хімічні реактиви': 'chemical reagents',
    'терези': 'scales',
    'термометр': 'thermometer',
    'колби': 'flasks',
    'пробірки': 'test tubes',
    'штативи': 'tripods',
    'скелети': 'skeletons',
    'гербарій': 'herbarium',
    'карти': 'maps',
    'глобус': 'globe'
};

// Функція для перекладу назви аудиторії
function translateRoomName(name) {
    if (!name) return name;
    return roomNamesTranslations[name] || name;
}

// Функція для перекладу обладнання
function translateEquipment(equipmentArray) {
    if (!equipmentArray || !Array.isArray(equipmentArray)) return [];
    return equipmentArray.map(item => {
        const translated = equipmentTranslations[item.toLowerCase()];
        return translated || item;
    });
}

// Middleware для автоматичного заповнення англійських полів перед збереженням
classroomSchema.pre('save', function (next) {
    if (this.name) {
        this.nameEn = translateRoomName(this.name);
    }
    if (this.equipment && this.equipment.length > 0) {
        this.equipmentEn = translateEquipment(this.equipment);
    }
    next();
});

// Middleware для оновлення (findOneAndUpdate)
classroomSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();

    if (update.name) {
        update.nameEn = translateRoomName(update.name);
    }
    if (update.equipment && Array.isArray(update.equipment)) {
        update.equipmentEn = translateEquipment(update.equipment);
    }

    next();
});

module.exports = mongoose.model('Classroom', classroomSchema);