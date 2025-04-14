const { compareTime } = require('@tool/command/time')
const { sensor } = require('@tool/command/sensor')
const { ctrlB } = require('@tool/command/fan')
const { data: store } = require('@store')

/**
 * Плавный пуск/стоп ВНО склада
 * @param {*} bldId Id склада
 * @param {*} obj Глобальные данные склада
 * @param {*} s Настройки склада
 * @param {*} seB Датчики склада
 * @param {*} m Доп. устройства склада
 * @param {*} resultFan Данные о ВНО всего склада
 */
function soft(bldId, obj, s, seB, m, resultFan) {
	// Плавный пуск (все вентиляторы на контакторах)
	if (!resultFan.list?.length) return
	// По секциям
	resultFan.list.forEach((secId, idx) => {
		const aCmd = store.aCmd?.[secId]?.fan
		const fans = resultFan.fan.filter((el) => el.owner.id === secId)
		if (!aCmd) return
		// Плавный пуск (все вентиляторы на контакторах)
		relay(bldId, secId, obj, aCmd, fans, s, seB, idx)
		// Плавный пуск (1 вентилятор на ПЧ, остальные на контакторах)
	})
}

module.exports = soft

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
function relay(bldId, secId, obj, aCmd, fans, s, seB, idx) {
	const { p } = sensor(bldId, secId, obj)
	// acc.count - Кол-во включенных вентиляторов (всегда один вентилятор в работе, независимо от давления в канале)
	// Изменяя данное число, регулируем порядком вкл/выкл вентиляторов для поддержания давления в канале
	const acc = store.watchdog.softFan
	acc.count ??= 1
	acc.delay ??= new Date(new Date().getTime() + aCmd.delay * 1000)
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
		s.fan.pressure + s.fan.hysteresisP
	)

	// ****************** Авто: команда выкл ВНО секции ******************
	if (aCmd.type === 'off') {
		fans.forEach((f, i) => {
			ctrlB(f, bldId, 'off')
			// Сброс аккумулятора
			store.watchdog.softFan = {}
		})
		return
	}

	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	let on = p < s.fan.pressure - s.fan.hysteresisP
	let off = p > s.fan.pressure + s.fan.hysteresisP
	// Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)

	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, aCmd, fans.length)
	checkOff(off, acc, aCmd)

	// Непосредственное включение
	fans.forEach((f, i) => {
		i < acc.count ? ctrlB(f, bldId, 'on') : ctrlB(f, bldId, 'off')
	})
}

/**
 * Управление очередью вкл ВНО
 * @param {boolean} on Давление в канала меньше задания
 * @param {object} acc {count-кол-во вентиляторов в работе, delay - время на выравнивание давления, после вкл/выкл ВНО}
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {number} length Кол-во вентиляторов в секции
 * @returns
 */
function checkOn(on, acc, aCmd, length) {
	if (!on) return
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	if (!compareTime(acc.delay, aCmd.delay)) {
		console.log(11, `Ожидайте пока выровнится давление после вкл ВНО`)
		return
	}
	if (++acc.count > length) {
		acc.count = length
		return
	}
	acc.delay = new Date(new Date().getTime() + aCmd.delay * 1000)
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
	acc.delay = new Date(new Date().getTime() + aCmd.delay * 1000)
}
