const { isExtralrm } = require('@tool/message/extralrm')
const { setACmd } = require('@tool/command/set')
const soft = require('./soft')

/**
 * Для секций в авторежиме: если у одной секции формируется сигнал на включение вент (2я секция в авторежиме - вент остановлены),
 * включается вентиляторы на всех секциях в авторежиме
 * @param {string} bld Cклад
 * @param {object} resultFan Задание на включение ВНО
 * @param {object} s Настройки склада
 * @param {object} obj Глобальные данные склада
 */
function fan(bld, obj, s, seB, m, resultFan) {
	const start = resultFan.start.includes(true)
	// Формирование aCmd: команда авторежима на вкл/выкл ВНО
	fnACmd(bld._id, resultFan, s, start)
	// Формирование aCmd: Прогрев клапанов
	if (!start) fnFanWarm(resultFan, s)
	// Плавный пуск/стоп ВНО склада
	soft(bld._id, obj, s, seB, m, resultFan)
}

module.exports = fan

/**
 * Формирование aCmd: команда авторежима на вкл/выкл ВНО
 * @param {*} bldId Id склада
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 * @param {*} start авторежим: вкл/выкл ВНО
 */
function fnACmd(bldId, resultFan, s, start) {
	resultFan.list.forEach((idS) => {
		if (!isExtralrm(bldId, idS, 'local') && !isExtralrm(bldId, null, 'local'))
			setACmd('fan', idS, { delay: s.fan.delay, type: start ? 'on' : 'off' })
		else setACmd('fan', idS, { delay: s.fan.delay, type: 'off' })
	})
}

/**
 * Прогрев клапанов
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 */
// Задержка включения ВНО при прогреве клапанов
const delay = 3
function fnFanWarm(resultFan, s) {
	const group = Object.values(resultFan.warming)
	for (const o of group) {
		setACmd('fan', o.sectionId, { delay, type: 'on', warming: true })
	}
}
