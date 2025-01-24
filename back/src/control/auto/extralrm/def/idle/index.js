const { wrTimer, delTimer } = require('@store')

// Авторежимы склада
const am = ['drying', 'cure', 'cooling', 'heat']

// Время работы
function idle(building, section, obj, s, se, m, automode, acc, data) {
	const name = `Склад ${building.code ?? ''}`
	const exclude = am.filter((el) => el != automode)
	// По таймерам запрета
	for (const key in s.idle) {
		acc[key] ??= {}
		// Проверка диапазона
		const check = checkRange(s?.idle?.[key]?.begin, s?.idle?.[key]?.end, exclude.includes(key))
		// Включение запрета
		if (check && !acc?.[key]?.flag) {
			acc[key].flag = true
			wrTimer(building._id, key, name)
		}
		// Удаление запрета
		if (!check) {
			delete acc?.[key]?.flag
			delTimer(building._id, key)
		}
	}
}

module.exports = idle

function checkRange(begin, end, exclude) {
	const cur = +new Date().toLocaleTimeString('ru-RU', { hour: 'numeric', minute: 'numeric' }).split(':').join('')
	begin = begin ? +begin.split(':').join('') : 0
	end = end ? +end.split(':').join('') : 0
	// Запрет выключить
	// Исключить запреты авторежимов, кроме текущего режима склада
	if (exclude) return false
	if (begin === end && end === 0) return false
	// Запрет включить
	if (begin === end && end !== 0) return true
	// 1 случай проверки
	if (begin !== 0 && begin > end) {
		// Запрет включить
		if (cur >= begin || cur < end) return true
		// Запрет выключить
		return false
	}
	// 2 случай проверки
	if (begin < end) {
		// Запрет включить
		if (cur >= begin && cur < end) return true
		// Запрет выключить
		return false
	}
	// по-умолчанию Запрет выключить
	return false
}
