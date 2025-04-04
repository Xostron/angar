const { isExtralrm } = require('@tool/message/extralrm')
const { setACmd } = require('@tool/command/set')
const { ctrlB } = require('@tool/command/fan')
const { data: store } = require('@store')
/**
 * Для секций в авторежиме: если у одной секции формируется сигнал на включение вент (2я секция в авторежиме - вент остановлены),
 * включается вентиляторы на всех секциях в авторежиме
 * @param {string} bld склад
 * @param {object} resultFan задание на включение ВНО
 * @param {object} s настройки склада
 * @param {object} obj глобальные данные склада
 */
function fan(bld, resultFan, s, obj) {
	// console.log(333, resultFan)
	const start = resultFan.start.includes(true)
	fnFan(bld._id, resultFan, s, start)
	// Прогрев клапанов
	if (!start) fnFanWarm(resultFan, s)

	// Непосредственное включение вентиляторов (ступенчато)
	ctrlFSoft(resultFan, bld._id)
}

// Плавный пуск/стоп вентиляторов на всех секция по цепочке
function ctrlFSoft(resultFan, buildingId) {
	const warm = Object.values(resultFan.warming)
	const warmId = warm.map((o) => o.sectionId)
	const warmFan = warm.map((o) => o.fan)
	// Штатное управление
	main(resultFan.list, resultFan.fan, buildingId)
	// Прогрев клапанов
	// main(warmId, warmFan, buildingId, store.accWarm)
}

function main(listId, fan, buildingId) {
	if (!listId?.length) return
	listId.forEach((sectionId) => {
		const aCmd = store.aCmd?.[sectionId]?.fan

		if (!aCmd) return
		// Расчет задержек вкл/выкл вентиляторов
		if ((aCmd.type === 'on' && aCmd.status != 'readyOn') || (aCmd.type === 'off' && aCmd.status != 'readyOff')) {
			fan.forEach((fan, i) => {
				store.watchdog ??= {}
				store.watchdog[fan._id] ??= {}
				store.watchdog[fan._id].endDelay = +new Date().getTime() + i * aCmd.delay * 1000
			})
			if (aCmd.type === 'on') aCmd.status = 'readyOn'
			if (aCmd.type === 'off') aCmd.status = 'readyOff'
		}
		// Вкл/выкл вентилятора (aCmd.end - флаг о плавном останове насосов)
		aCmd.end = fan.length
		for (const f of fan) {
			if (store.watchdog?.[f._id]?.endDelay <= +new Date().getTime()) {
				ctrlB(f, buildingId, aCmd.type)
				--aCmd.end
			}
		}
		// console.log(333, aCmd, store.watchdog)
	})
}

/**
 * Формирование команд на вкл/выкл напорных вентиляторов
 * @param {*} start Условие пуска вентиляторов on - вкл, off - выкл
 * @param {*} sectionId
 * @param {*} s Настройки склада
 * @returns
 */
function fnFan(idB, resultFan, s, start) {
	// Задания от автомата нет
	if (!resultFan?.list?.length) {
		// Проверка секцию выключили? и пошаговое отключение
		// offSection(resultFan, s, idB, obj)
		return
	}
	// Команда на вкл/выкл напорных вентиляторов
	fnACmd(start, resultFan, s, idB)
}

// Команда на вкл/выкл напорных вентиляторов
function fnACmd(start, resultFan, s, idB) {
	resultFan.list.forEach((idS) => {
		if (!isExtralrm(idB, idS, 'local') && !isExtralrm(idB, null, 'local')) setACmd('fan', idS, { delay: s.sys.fan, type: start ? 'on' : 'off' })
		else setACmd('fan', idS, { delay: s.sys.fan, type: 'off' })
	})
}

function fnFanWarm(resultFan, s) {
	const group = Object.values(resultFan.warming)
	for (const o of group) {
		setACmd('fan', o.sectionId, { delay: s.sys.fan, type: 'on' })
	}
}

// TODO плавное отключение вентил, при секции - ВЫКЛ
function offSection(resultFan, s, idB, obj) {
	const { data, retain } = obj
	// Список вентиляторов секции, которую переключили в режим ВЫКЛ
	const offList = Object.entries(retain?.[idB]?.mode ?? {})
		.filter(([key, val]) => val === null)
		.map(([key, val]) => key)

	const fan = data.fan.filter((el) => offList.includes(el.owner.id) && el.type === 'fan')
	resultFan.list = offList
	resultFan.fan = fan
	// Пошаговое выключение
	fnACmd(false, resultFan, s, idB)
}

module.exports = fan
