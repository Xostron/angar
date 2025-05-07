const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')
const _RAMP = 5000
const _MAX = 100

/**
 * Управление очередью вкл ВНО
 * @param {boolean} on Давление в канала меньше задания
 * @param {object} acc {count - кол-во вентиляторов в работе, delay - время на выравнивание давления, после вкл/выкл ВНО}
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {number} length Кол-во вентиляторов в секции
 * @returns
 */
function checkOn(on, acc, aCmd, length) {
	if (!on) return
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	const time = acc.count !== 1 ? aCmd.delay : aCmd.delay + _RAMP
	if (!compareTime(acc.delay, time)) {
		// console.log(555, `Ожидайте пока выровнится давление после вкл ВНО`, time)
		return
	}
	// Включаем следующий ВНО
	if (++acc.count > length) {
		acc.count = length
		return
	}
	// Новая точка отсчета
	acc.delay = new Date()
	console.log(111, 'Вкл ВНО и фиксирую новое время', acc.delay)
}

/**
 * Управление очередью выкл ВНО
 * @param {boolean} off Давление в канале выше задания
 * @param {object} acc {count-кол-во вентиляторов в работе, delay - время на выравнивание давления, после вкл/выкл ВНО}
 * @param {object} aCmd Авто - команда на вкл/выкл ВНО
 * @returns
 */
function checkOff(off, acc, aCmd) {
	if (!off) return
	const time = aCmd.delay
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	if (!compareTime(acc.delay, time)) {
		// console.log(22, `Ожидайте пока выровнится давление после откл ВНО`)
		return
	}
	if (--acc.count < 1) {
		acc.count = 1
		return
	}
	acc.delay = new Date()
	console.log(222, 'Выкл ВНО и фиксирую новое время', acc.delay)
}

/**
 * Регулирование ПЧ
 * @param {object} acc аккумулятор
 * @param {object} aCmd команда авто
 * @param {boolean} on сигнал на повышение давления
 * @param {boolean} off сигнал на понижение давления
 * @param {object} s настройки
 * @returns {boolean} acc.busy - Флаг регулирование частоты (true: запрет на вкл/выкл соседних ВНО)
 */
function regul(acc, on, off, s) {
	// Когда задание ПЧ увеличивается до 100 - инициализируем новое время для подключения следующего ВНО
	if (acc.fc.value >= 100 && on) {
		acc.fc.value = 100
		acc.delay = !acc.first ? new Date() : acc.delay
		acc.first = true
		return false
	}
	acc.first = false

	// Авария Антидребезг ВНО - выходим из регулирования
	if (acc.stable) return false

	// Время ожидания следующего шага
	const time = s.fan.next * 1000

	// Пошагово увеличиваем
	if (on) {
		if (!acc.fc.delay) {
			acc.fc.delay = new Date()
			// acc.fc.value += s.fan.step
			// Достигли макс задания
			if (acc.fc.value >= _MAX) {
				// При работе одного ВНО
				if (acc.count === 1) {
					acc.fc.value = _MAX
					// acc.delay = new Date()
				}
				// При работе больше одного ВНО => задание на 100 и
				// выходим с разрешением на вкл/выкл следующего ВНО
				return false
			}
		}
		// Ждем стабилизации
		if (!compareTime(acc.fc.delay, time)) {
			return true
		}
		// Время стабилизации прошло
		acc.fc.value += s.fan.step
		acc.fc.value = acc.fc.value > _MAX ? _MAX : acc.fc.value
		delete acc.fc.delay
	}

	// Пошагово уменьшаем задание ПЧ
	if (off) {
		if (!acc.fc.delay) {
			acc.fc.delay = new Date()
			// Достигли минимального задания
			if (acc.fc.value <= s.fan.min) {
				if (acc.count === 1) {
					// При работе одного ВНО
					acc.fc.value = s.fan.min
					return true
				}
				// При работе больше одного ВНО => задание на 100 и
				// выходим с разрешением на вкл/выкл следующего ВНО
				acc.fc.value = _MAX
				return false
			}
		}
		// Ждем стабилизации
		if (!compareTime(acc.fc.delay, time)) {
			return true
		}
		// Время стабилизации прошло
		acc.fc.value -= s.fan.step
		acc.fc.value = acc.fc.value < s.fan.min ? s.fan.min : acc.fc.value

		delete acc.fc.delay
	}
	return true
}

/**
 * Выключить ВНО
 * @param {*} fans Ветиляторы
 * @param {*} bldId Склад Id
 * @param {*} aCmd Команда авто
 * @returns {boolean} true - выкл ВНО, false - разрешить вкл ВНО
 */
function turnOff(fans, bldId, aCmd) {
	if (aCmd.type !== 'off' || !aCmd.type) return false
	// Сброс аккумулятора
	store.watchdog.softFan = {}
	fans.forEach((f, i) => {
		f?.ao?.id ? ctrlAO(f, bldId, 0) : null
		ctrlDO(f, bldId, 'off')
	})
	return true
}

/**
 * Включить ВНО
 * @param {*} fans Ветиляторы
 * @param {*} bldId Склад Id
 * @param {*} acc Аккумулятор
 */
function turnOn(fans, bldId, acc) {
	fans.forEach((f, i) => {
		f?.ao?.id ? ctrlAO(f, bldId, acc?.fc?.value) : null
		i < acc.count ? ctrlDO(f, bldId, 'on') : ctrlDO(f, bldId, 'off')
	})
}

module.exports = { checkOn, checkOff, regul, turnOn, turnOff }
