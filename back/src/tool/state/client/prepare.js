const {
	convertPC,
	convertSec,
	convertTenta,
	delta,
	deltaTol,
} = require('@tool/state/fn');
const transformStore = require('@routes/api/tenta/read/store/transform');
const transformPC = require('@routes/api/tenta/read/pc/transform');
const { data: store, dataDir } = require('@store');
const { readTO } = require('@tool/json');
const fsp = require('fs').promises;
const tolerance = require('../fn/tolerance.json');
/**
 * Request на админ-сервер
 * Формирование state (значения данных по PC)
 * @returns {object}	result Данные по датчикам (для Tenta админки),
 * 						hub: {init:boolean, last:boolean, state:object}
 * 							init Инициализация пройдена,
 * 							last Предыдущая передача данных прошла успешна
 * 							state Данные по датчикам (предыдущее состояние)
 * 						present Данные по датчикам (для расчета delta)
 */
module.exports = async function prepareReq() {
	const hub = store.hub; //Аккумулятор прошлых значений
	let present = {}, // Актуальное состояние ангара (Вторичная - составные ключи)
		diffing, // delta-изменения (Вторичная - составные ключи)
		result; // ответ для Админки
	const raw = store.value; // Актуальное состояние ангара (первичная форма)
	try {
		// Рама pc
		const files = (await fsp.readdir(dataDir)).filter((el) =>
			el.includes('json')
		);
		const data = await readTO(files);

		// Настройка в админке: Получение данных от ЦС (вкл/выкл : true/false)
		// TODO - отключено для сервера ангара, чтобы у нас всегда формировался какой-либо state
		// if (!data?.pc?.state?.on) {
		// 	console.log('\x1b[33m%s\x1b[0m', 'Получение данных от ЦС выключен')
		// 	return null
		// }

		// Собираем значения по складу
		if (!Object.keys(raw).length) {
			// console.log('\x1b[33m%s\x1b[0m', 'Данные не готовы')
			return null;
		}

		// Карточки PC
		const resPC = transformPC(raw, data.building, data.section, data.fan);

		// Полное содержимое секции и карточки секций
		for (const sec of data.section)
			present[sec._id] = await transformStore(sec.buildingId, sec._id);

		// Преобразуем в одноуровневый объект с составными ключами
		present = { ...convertPC(resPC), ...convertSec(present) };
		
		// Расчет delta (первое включение прошло успешно hub.init = true)
		// diffing = hub.init ? delta(present, hub.state) : null
		// const sens = data.sensor.reduce((acc, el, i) => {
		// 	acc[el._id] = el.tolerance ?? 1
		// 	return acc
		// }, {})
		// Датчики id с допусками из tolerance.json
		const sens = {};
		data.sensor.forEach((el) => (sens[el._id] = tolerance[el.type]));
		diffing = hub.init
			? deltaTol(present, hub.state, sens, tolerance)
			: null;
		// Формируем данные для Tenta
		result = convertTenta(diffing ?? present, data.pc._id);
		return { result, hub, present, diffing };
	} catch (error) {
		console.error(
			'\x1b[33m%s\x1b[0m',
			'POS->Tenta: 1. ❌Ошибка подготовки данных',
			error
		);
	}
};
