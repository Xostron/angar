const { compareTime } = require('@tool/command/time')

/**
 * Последовательное выключение - ПЧ Схема
 * @param {boolean} off Давление в канале выше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Авто - команда на вкл/выкл ВНО
 * @returns
 */
function fc(off, acc) {
	if (!off) {
		// console.log('\tCheckOFF: (off=false) кол-во работающих ВНО => без изменений')
		return
	}

	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	if (!compareTime(acc.date, acc.delayRelay)) {
		// console.log(
		// 	'\tCheckOFF: (off=true) кол-во работающих ВНО => Ожидание',
		// 	acc.delayRelay / 1000,
		// 	'сек'
		// )
		return
	}
	// Частоту ПЧ обратно увеличиваем на 100%, а ВНО релейное - отключаем
	if (acc.order >= 0) {
		acc.fc.sp = 100
	}
	// Выкл следующего ВНО
	if (--acc.order <= -1) {
		acc.order = -1
		// console.log('\tCheckOFF: (off=true) кол-во работающих ВНО => МИН = 0')
		return
	}
	// Обновление точки отсчета
	// console.log('\tCheckOFF: (off=true) кол-во работающих ВНО => уменьшаем -1 ВНО')
	acc.date = new Date()
}

// Последовательное выключение - Релейная схема
function relay(off, acc, where) {
	if (!off) {
		// console.log('\tCheckOFF: (off=false) кол-во работающих ВНО => без изменений')
		return
	}

	// Проверка времени (время на стабилизацию давления/темп в канале, после выкл ВНО)
	if (!compareTime(acc.date, acc.delayRelay)) {
		// console.log(
		// 	'\tCheckOFF: (off=true) кол-во работающих ВНО => Ожидание',
		// 	acc.delayRelay / 1000,
		// 	'сек'
		// )
		return
	}
	// Выкл следующего ВНО
	switch (where) {
		case 'cold':
			if (--acc.order <= -1) {
				acc.order = -1
				// console.log('\tCheckOFF: (off=true) кол-во работающих ВНО => МИН = 0')
				return
			}
			break
		default:
			if (--acc.order <= 0) {
				acc.order = 0
				// console.log('\tCheckOFF: (off=true) кол-во работающих ВНО => МИН = 0')
				return
			}
			break
	}
	// console.log('\tCheckOFF: (off=true) кол-во работающих ВНО => уменьшаем -1 ВНО')
	// Обновление точки отсчета
	acc.date = new Date()
}
const checkOff = {
	fc,
	relay,
}

module.exports = checkOff
