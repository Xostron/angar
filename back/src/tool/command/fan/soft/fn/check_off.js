const { compareTime } = require('@tool/command/time')

/**
 * Последовательное выключение - ПЧ Схема
 * @param {boolean} off Давление в канале выше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Авто - команда на вкл/выкл ВНО
 * @returns
 */
function fc(off, acc, aCmd) {
	if (!off) return
	const time = aCmd.delay
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	if (!compareTime(acc.date, time)) return
	// Выкл следующего ВНО
	if (--acc.order <= -1) {
		acc.order = -1
		return
	}
	// Обновление точки отсчета
	acc.date = new Date()
}

// Последовательное выключение - Релейная схема
function relay(off, acc, aCmd, where) {
	if (!off) return
	const time = aCmd.delay
	// Проверка времени (время на стабилизацию давления/темп в канале, после выкл ВНО)
	if (!compareTime(acc.date, time)) {
		return
	}
	// Выкл следующего ВНО
	switch (where) {
		case 'cold':
			if (--acc.order <= -1) {
				acc.order = -1
				return
			}
			break
		default:
			if (--acc.order <= 0) {
				acc.order = 0
				return
			}
			break
	}

	// Обновление точки отсчета
	acc.date = new Date()
}
const checkOff = {
	fc,
	relay,
}

module.exports = checkOff
