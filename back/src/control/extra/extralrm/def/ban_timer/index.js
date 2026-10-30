const { wrTimer, delTimer } = require('@tool/message/ban_timer')
const { data: store } = require('@store')
// Авторежимы склада
const am = ['drying', 'cure', 'cooling', 'heat']

// Таймера запретов
function banTimer(building, section, obj, s, se, m, automode, acc, data) {
	const name = `Склад ${building.code ?? ''}`
	const exclude = am.filter((el) => el != automode)
	let _idle
	if (building.type == 'cold') _idle = s?.idleCold
	else _idle = s?.idle
	// console.log(123, building?.type, _idle)
	// По таймерам запрета
	for (const key in _idle) {
		acc[key] ??= {}
		// Проверка диапазона
		const check = checkRange(_idle?.[key]?.begin, _idle?.[key]?.end, exclude.includes(key))
		// console.log('\x1b[36m%s\x1b[0m', '===========Таймеры запретов=========')
		// if (key == 'drying')
		// console.log(444, key, check)
		// Включение запрета
		if (check && (!acc?.[key]?.flag || !store.alarm.timer?.[building._id]?.[key])) {
			acc[key].flag = true
			// console.log(555, key)
			wrTimer(building, key, name)
		}
		// Удаление запрета
		if (!check) {
			delete acc?.[key]?.flag
			delTimer(building._id, key)
		}
	}
}

module.exports = banTimer

function checkRange(begin, end, exclude) {
	const cur = +new Date()
		.toLocaleTimeString('ru-RU', { hour: 'numeric', minute: 'numeric' })
		.split(':')
		.join('')
	// Исключить запреты авторежимов, кроме текущего режима склада
	if (exclude) return false
	if (!(begin instanceof Array)) return false
	const isBan = begin?.some((beg, i) => {
		const _begin = beg ? +beg.split(':').join('') : 0
		const _end = end[i] ? +end[i].split(':').join('') : 0
		// Запрет выключить
		if (_begin === _end && _end === 0) return false
		// Запрет включить
		if (_begin === _end && _end !== 0) return true
		// 1 случай проверки
		if (_begin !== 0 && _begin > _end) {
			// Запрет включить
			if (cur >= _begin || cur < _end) return true
			// Запрет выключить
			return false
		}
		// 2 случай проверки
		if (_begin < _end) {
			// Запрет включить
			if (cur >= _begin && cur < _end) return true
			// Запрет выключить
			return false
		}
		// по-умолчанию Запрет выключить
		return false
	})
	return isBan
}
