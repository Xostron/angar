const { data: store } = require('@store')
const { getBS } = require('@tool/get/building')
const { debounce } = require('./debounce')
const { webSensAlarm, valid } = require('./fn')
const stateWeather = require('./weather')
/**
 * Анализ датчиков
 * result[s._id] - отображение на экране настроек датчиков,
 * result.total - значения датчиков для расчетов алгоритма и отображения на мнемосхемах
 * @param {object} equip конфигурация склада json
 * @param {object} val сырые данные с опроса модулей
 * @param {object} retain сохраненные настройки склада
 * @param {object} result Результат
 */
function vSensor(equip, val, retain, result) {
	const { sensor, building, weather, binding } = equip
	// Собираем аналоговые входа = датчики sensor + binding аналоговые входа(ai)
	const ai = binding?.filter((el) => el.type === 'ai') ?? []
	const sens = [...sensor, ...ai]
	for (const s of sens) {
		// Поиск владельца сигнала binding (вентилятор)
		let own, owner
		if (s.type === 'ai') {
			own = equip?.[s.owner.type].find((el) => el._id === s.owner.id)
			owner = getBS(own, equip)
		} else {
			// Владелец датчика (секция или склад)
			owner = getBS(s, equip)
		}

		// Обработанное значение датчика
		const r = valid(s, owner, val, equip, retain)
		// Антидребезг датчика^ из аккумулятора или обработанное значение
		result[s._id] = debounce(
			owner?.building?._id,
			s._id,
			r,
			store.holdSensor?.[s._id],
			retain,
			s,
		)
		// Вторая обработка только для датчиков влажности улицы и продукта
		// result[s._id] = fnHinHout(owner?.building?._id, s, result[s._id], retain)
		// if (s.type === 'hout') 
			// console.log(221, s.type, result[s._id])
		// Аварийные сообщения датчика
		webSensAlarm(result[s._id], owner?.building, owner?.section, s)
		// Обновляем прошлое значение
		store.holdSensor[s._id] = result?.[s._id]
	}
	// Добавление прогноза погоды на экран настроек датчиков
	for (const bld of building) {
		result[bld._id] ??= {}
		result[bld._id].tweather = stateWeather(bld._id, weather, retain, 'tweather', 'temp')
		result[bld._id].hweather = stateWeather(bld._id, weather, retain, 'hweather', 'humidity')
	}
}

module.exports = vSensor
