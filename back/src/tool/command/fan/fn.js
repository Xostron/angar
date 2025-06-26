const { isExtralrm } = require('@tool/message/extralrm')
const { setACmd } = require('@tool/command/set')

/**
 * Команда авторежима на пуск/стоп ВНО секции
 * @param {*} bldId Id склада
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 * @param {*} start команда авторежим: пуск/стоп ВНО секции
 */
function fnACmd(bldId, resultFan, s, start) {
	const delay = s.fan.delay * 1000
	resultFan.list.forEach((idS) => {
		if (!isExtralrm(bldId, idS, 'local') && !isExtralrm(bldId, null, 'local')) {
			!resultFan?.force ? setACmd('fan', idS, { delay, type: start ? 'on' : 'off' }) : setACmd('fan', idS, { delay, type: 'on' })
		} else setACmd('fan', idS, { delay, type: 'off' })
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

module.exports = {fnACmd, fnFanWarm}