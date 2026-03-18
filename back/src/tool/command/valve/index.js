const { readAcc } = require('@store/index')
const { isExtralrm } = require('@tool/message/extralrm')
const { isErrM } = require('@tool/message/plc_module')
const { setACmd } = require('@tool/command/set')
const { data: store } = require('@store')

/**
 * Анализ сигналов: Состояние клапана
 * @param {object} vlv Id Клапана
 * @param {object} value Опрос модулей + анализ
 * @returns
 *  iopn: 'Открывается',
	icls: 'Закрывается',
	opn: 'Открыт',
	cls: 'Закрыт',
	popn: 'Частично открыт',
	alr: 'Неисправность',
 */
function stateV(vlv, value, idB, idS, equip) {
	if (!vlv._id) return null
	const alr = isAlrmByVlv(idB, vlv, equip)
	if (alr) return 'alr'
	const vlvLim = isExtralrm(idB, idS, 'vlvLim')
	const vlvLimB = isExtralrm(idB, null, 'vlvLim')
	const crash = isExtralrm(idB, 'vlvCrash', vlv._id)
	const iopn = value?.outputEq?.[vlv._id]?.open
	const icls = value?.outputEq?.[vlv._id]?.close
	const opn = value?.[vlv._id]?.open
	const cls = value?.[vlv._id]?.close
	if ((opn && cls) || (iopn && icls) || crash || vlvLim || vlvLimB) return 'alr'
	if (!opn && !cls && !iopn && !icls) return 'popn'
	if (iopn) return 'iopn'
	if (icls) return 'icls'
	if (opn) return 'opn'
	if (cls) return 'cls'
	return null
}

/**
 * Текущее состояние клапана
 * @param {string} vlvId ИД клапана
 * @param {object} value Опрос модулей + анализ
 * @returns
 */
function curStateV(vlvId, value) {
	if (!vlvId) return null
	return value?.[vlvId]?.state ?? null
}

// Авария долгого закрытия
function isLongVlv(idB, v, type = 'open') {
	const acc = readAcc(idB, 'building', 'alrValve')
	if (type === 'open') {
		return acc?.[v._id]?.alarmOpn
	}
	return acc?.[v._id]?.alarmCls
}

/**
 * АВТО: Формирование команды управления клапаном
 * @param {*} data Состояние клапана
 * @param {*} idS ИД секции
 * @param {*} s Настройки склада
 */
function configCmdV(data, idS, s) {
	const { open, close, forceOpn, forceCls, sp } = data
	// Нет команд
	if (!open && !close && !forceOpn && !forceCls && typeof sp !== 'number') return

	let type
	if (typeof sp === 'number') type = null
	else if (open || forceOpn) type = 'open'
	else type = 'close'

	const o = {
		step: s.sys.step,
		delay: s.sys.wait,
		kIn: s.sys.cf.kIn,
		kOut: s.sys.cf.kOut.k,
		type,
		sp,
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

module.exports = {
	stateV,
	curStateV,
	isLongVlv,
	configCmdV,
	fnLookCls,
}

/**
 * Модули ПЛК ВНО неисправны?
 * Поиск модулей к которым привязан ВНО
 * Проверка найденных модулей на неисправность
 * Если какой-либо модуль неисправен -> ВНО в аварии
 * Примечание:
 * 1. Разгонные ВНО, наблюдаем за всеми модулями
 * 2. Секционные ВНО и ВНО испарителей: когда склад ВКЛ и секция НЕ В РУЧ РЕЖИМЕ
 * наблюдаем за всеми модулями, иначе учитываем только модули ВЫХОДОВ
 *
 * @param {string} idB ИД склада
 * @param {object} fan Рама ВНО
 * @param {object} equip Рама оборудования
 * @param {object} retain Сохраненные данные
 * @returns true Неисправны / false Модули ОК
 */
function isAlrmByVlv(idB, vlv, equip) {
	const { signal, module } = equip
	// Включен ли склад
	// const start = retain?.[idB]?.start
	// Режим секции: авто true, ручной false, выкл null
	// const mode = retain?.[idB]?.mode?.[idS]
	// console.log(start, mode, start && mode !== false)
	// Коллекция модулей ПЛК
	const arrM = new Set()
	// 1. Найти модули обратной связи Клапана (концевики, авария двигателя)

	signal
		.filter((el) => el?.owner?.id === vlv._id)
		.forEach((el) => {
			arrM.add(el?.module?.id)
		})
	// 2. Найти модули дискретных выходов
	arrM.add(vlv?.module?.on?.id)
	arrM.add(vlv?.module?.off?.id)
	// 3. Проверка модулей

	return [...arrM].some((idM) => {
		const t = isErrM(idB, idM)
		const mdl = module.find((el) => el._id === idM)
		// console.log(1, `Клапан ${vlv.type} ${vlv._id}, Модуль ${idM} ${mdl.ip}, авария=${t}`)
		return t
	})
}
