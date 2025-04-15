const { compareTime } = require('@tool/command/time')
const { sensor } = require('@tool/command/sensor')
const { ctrlB } = require('@tool/command/fan')
const { data: store } = require('@store')
const _RAMP = 5000
const _MAX = 100
/**
 * Плавный пуск ВНО в секции на контакторах
 * @param {string} bldId Id склада
 * @param {string} secId Id секции
 * @param {object} obj Глобальные данные склада
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {object[]} fans Информация по ВНО
 * @param {object} s Настройки склада
 * @param {object} seB Датчики склада (на всякий случай)
 * @param {number} номер секции
 * @returns
 */
function fc(bldId, secId, obj, aCmd, fans, s, seB, idx) {
	const { p } = sensor(bldId, secId, obj)
	// acc.count - Кол-во включенных вентиляторов (всегда один вентилятор в работе, независимо от давления в канале)
	// Изменяя данное число, регулируем порядком вкл/выкл вентиляторов для поддержания давления в канале
	store.watchdog.softFan[secId] ??= {}
	const acc = store.watchdog.softFan[secId]
	acc.count ??= 1
	acc.delay ??= new Date()
	acc.busy ??= false
	acc.fc ??= {}
	acc.fc.value ??= 100
	console.log(
		444,
		`FC: Склад ${bldId.slice(bldId.length - 4, bldId.length)} Секция ${idx}: `,
		`Авто = "${aCmd.type}",`,
		'Давление в канале =',
		p,
		'Задание по давлению',
		s.fan.pressure - s.fan.hysteresisP,
		'...',
		s.fan.pressure,
		'...',
		s.fan.pressure + s.fan.hysteresisP,
		acc.delay,
		aCmd.delay
	)

	// ****************** Авто: команда выкл ВНО секции ******************
	turnOff(fans, bldId, aCmd)

	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	let on = p < s.fan.pressure - s.fan.hysteresisP
	let off = p > s.fan.pressure + s.fan.hysteresisP

	// Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)
	// Антидребезг ВНО
	if (acc.stable) (on = false), (off = false)
	// Регулирование по ПЧ
	acc.busy = regul(acc, on, off)
	if (acc.busy) (on = false), (off = false)

	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, aCmd, fans.length)
	checkOff(off, acc, aCmd)

	// Непосредственное включение
	fans.forEach((f, i) => {
		f?.ao?.id ? ctrlAO(f, bldId, acc.fc.value) : null
		i < acc.count ? ctrlB(f, bldId, 'on') : ctrlB(f, bldId, 'off')
	})
}

module.exports = fc

function regul(acc, aCmd, on, off, s) {
	if (acc.fc.value >= 100) return false
	// Пошагово увеличиваем
	if (on) {
		if (!acc.fc.delay) {
			acc.fc.delay = new Date()
			acc.fc.value += s.fan.step
			// Достигли макс задания
			if (acc.fc.value > _MAX) {
				// При работе одного ВНО
				if (acc.count === 1) acc.fc.value = _MAX
				// При работе больше одного ВНО => задание на 100 и
				// выходим с разрешением на вкл/выкл следующего ВНО
				return false
			}
		}
		// Ждем стабилизации
		if (!compareTime(acc.fc.delay, aCmd.delay)) {
			return true
		}
		// Время стабилизации прошло
		delete acc.fc.delay
	}
	// Пошагово уменьшаем задание ПЧ
	if (off) {
		if (!acc.fc.delay) {
			acc.fc.delay = new Date()
			acc.fc.value -= s.fan.step
			// Достигли минимального задания
			if (acc.fc.value < s.fan.min) {
				if (acc.count === 1) {
					// При работе одного ВНО
					acc.fc.value = s.fan.min
					return true
				}
				// При работе больше одного ВНО => задание на 100 и
				// выходим с разрешением на вкл/выкл следующего ВНО
				acc.fc.value = 100
				return false
			}
		}
		// Ждем стабилизации
		if (!compareTime(acc.fc.delay, aCmd.delay)) {
			return true
		}
		// Время стабилизации прошло
		delete acc.fc.delay
	}
	return true
}

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
	const delay = acc.count !== 1 ? aCmd.delay : aCmd.delay + _RAMP
	if (!compareTime(acc.delay, delay)) {
		console.log(11, `Ожидайте пока выровнится давление после вкл ВНО`)
		return
	}
	// Включаем следующий ВНО
	if (++acc.count > length) {
		acc.count = length
		return
	}
	// Новая точка отсчета
	acc.delayFC = new Date()
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
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	if (!compareTime(acc.delay, aCmd.delay)) {
		console.log(22, `Ожидайте пока выровнится давление после откл ВНО`)
		return
	}
	if (--acc.count < 1) {
		acc.count = 1
		return
	}
	// acc.delay = new Date(new Date().getTime() + aCmd.delay * 1000)
	acc.delay = new Date()
	console.log(222, 'Выкл ВНО и фиксирую новое время', acc.delay)
}

// Записть в аналоговый выход
function ctrlAO() {
	o, buildingId, value
}
{
	console.log(999, o.name, `Аналоговый выходв ${value} %`)
}

/**
 * Выключить вентиляторы
 * @param {*} fans Ветиляторы
 * @param {*} bldId Склад Id
 * @param {*} aCmd Команда авто
 * @returns
 */
function turnOff(fans, bldId, aCmd) {
	if (aCmd.type === 'off') {
		// Сброс аккумулятора
		store.watchdog.softFan = {}
		fans.forEach((f, i) => {
			if (f?.ao?.id) ctrlAO(f, bldId, 0)
			ctrlB(f, bldId, 'off')
		})
		return
	}
}
