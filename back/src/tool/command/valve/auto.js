const { setACmd } = require('@tool/command/set')
const fnStep = require('./step')
const checkForce = require('./force')

/**
 * Шаговое открытие/закрытие приточного клапана
 * @param {*} vlvS клапаны
 * @param {*} idB ссылка на склад
 * @param {*} idS ссылка на секцию
 * @param {*} retain сохраненные данные склада (настройки и т.д.)
 * @param {*} step принудительно закрыть
 * @param {*} delay принудительно открыть
 */
function ctrlVSoft(vlvS, idB, idS, retain, forceCls, forceOpn) {
	console.log('##############', idS, '##############')
	console.log(9900, 'Я снимаю нахуй')

	// Принудительное управление
	if (checkForce(idB, idS, vlvS, forceCls, forceOpn))
		return console.log(99001, 'Принудительное ', 'close=', forceCls, 'open=', forceOpn)

	// Шаговое управление
	fnStep(vlvS, idB, idS, retain)

	console.log('############## END')
}

/**
 * АВТО: Формирование команды управления клапаном
 * @param {*} open условие на открытие
 * @param {*} close условие на закрытие
 * @param {*} idS
 * @param {*} s Настройки склада
 * @returns
 */
function fnValve(data, idS, s) {
	const { open, close, forceOpn, forceCls } = data
	// Нет команд
	if (!open && !close && !forceOpn && !forceCls) return
	const o = {
		step: s.sys.step,
		delay: s.sys.wait,
		kIn: s.sys.cf.kIn,
		kOut: s.sys.cf.kOut.k,
		type: open ? 'open' : 'close',
	}
	setACmd('vlv', idS, o)
}

module.exports = { ctrlVSoft, fnValve }
