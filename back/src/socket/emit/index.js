const { io } = require('@tool/server');
const Aboc = require('@tool/abort_controller');
const { data: store } = require('@store');
const { insert } = require('@tool/db');

// Кэш последних сохранённых данных (JSON-строки) для сравнения
const prev = {};

/**
 * Сохранение данных в коллекцию MongoDB (только при изменении)
 * @param {String} code Имя коллекции
 * @param {Object|Array} data Данные для записи
 */
function saveToDB(code, data) {
	if (!store.db) return;
	try {
		const json = JSON.stringify(data);
		if (prev[code] === json) return;
		prev[code] = json;

		insert(store.db, code, { data, ts: new Date() })
			.catch((err) => console.error(`Ошибка записи в ${code}:`, err.message));
	} catch (e) {
		console.error(`Ошибка записи в ${code}:`, e.message);
	}
}

// Широковещательные сообщения (всем клиентам)
// значения сигналов
function cValue(data) {
	if (Aboc.check()) return;
	io.volatile.emit('c_input', data);
	saveToDB('input', data);
}

// склады и оборудование
function cEquip(data) {
	io.emit('c_equip', data);
	saveToDB('equip', data);
}

// Аварии
function cAlarm(data) {
	io.emit('c_alarm', data);
	saveToDB('alarm', data);
}

// Прогрев секции закончен
function cWarm(data) {
	io.emit('c_warm', data);
}

module.exports = { cValue, cEquip, cAlarm, cWarm };
