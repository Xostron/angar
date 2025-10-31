const { isExtralrm } = require('@tool/message/extralrm')
const { isErrM } = require('@tool/message/plc_module')

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
	const crash = isExtralrm(idB, idS, 'vlvCrash' + vlv._id)
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

module.exports = {
	stateV,
	curStateV,
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
		console.log(`Клапан${vlv.type} ${vlv._id}, Модуль ${idM} ${mdl.ip}, авария=${t}`)
		return t
	})
}
