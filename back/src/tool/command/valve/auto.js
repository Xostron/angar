const { setACmd } = require('@tool/command/set')
const fnStep = require('./step')
const checkForce = require('./force')
const { data: store } = require('@store')

/**
 * Шаговое открытие/закрытие приточного клапана
 * @param {*} vlvS клапаны
 * @param {*} idB ИД склада
 * @param {*} idS ИД секции
 * @param {*} retain сохраненные данные склада (настройки и т.д.)
 * @param {*} step принудительно закрыть
 * @param {*} delay принудительно открыть
 */
function ctrlVSoft(vlvS, idB, idS, retain, forceCls, forceOpn) {
	// Принудительное управление
	if (checkForce(idB, idS, vlvS, forceCls, forceOpn)) return

	// Шаговое управление
	fnStep(vlvS, idB, idS, retain)
}

/**
 * АВТО: Формирование команды управления клапаном
 * @param {*} data Состояние клапана
 * @param {*} idS ИД секции
 * @param {*} s Настройки склада
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

/**
 * Принудительно закрывать, если позиция приточного
 * клапана = 0мс && нет концевика закрытого положения &&
 * авто команда на закрытие
 * @param {*} bld Рама склада
 * @param {*} sect Рама секции
 * @param {*} vlvS Массив клапана
 * @param {*} obj Глобальные данные
 * @returns {boolean} true - принудительно закрыть
 */
function fnLookCls(bld, sect, vlvS, obj) {
	// Авто: Команда на закрытие
	const cmdCls = store.aCmd?.[sect._id]?.vlv?.type === 'close'
	// Все настройки склада
	const s = store?.calcSetting?.[bld._id] ?? {}
	// Приточный клапан
	const v = vlvS.find((el) => el.type === 'in')
	// Положение клапана, мс
	const pos = +obj.retain?.[bld._id]?.valvePosition?.[v._id]
	// Состояние клапана { open: false, close: false, crash: false, val: 61, state: 'popn' }
	const o = obj?.value?.[v._id]

	// Если позиция приточного клапана = 0мс && нет концевика закрытого положения
	// console.log(8801, 'Поиск концевика', pos === 0 && !o?.close && cmdCls, pos, o?.val, o?.close, cmdCls)

	// Принудительно закрывать
	if (pos === 0 && !o?.close && cmdCls) return true
	return false
}

module.exports = { ctrlVSoft, fnValve, fnLookCls }
