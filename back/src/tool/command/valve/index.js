const { isExtralrm } = require('@tool/message/extralrm')
const { setCmd } = require('@store')
/**
 * Управление клапаном открыть/закрыть/стоп
 * @param {*} vlv Клапан
 * @param {*} type Тип команды (open,close,stop)
 * @returns
 */
function ctrlV(vlv, buildingId, type) {
	if (!type) return null
	const bldId = vlv?._build ?? buildingId
	const mdlOn = vlv?.module?.on?.id
	const mdlOff = vlv?.module?.off?.id
	const chOn = vlv?.module?.on?.channel - 1
	const chOff = vlv?.module?.off?.channel - 1
	// Защита от клапанов без привязки модулей в админпанели
	if (!mdlOn || !mdlOff || isNaN(chOn) || isNaN(chOff)) return null

	const r = {}
	// stop
	r[bldId] = { [mdlOn]: { [chOn]: 0 } }
	r[bldId] = { ...r[bldId], [mdlOff]: { ...r[bldId][mdlOff], [chOff]: 0 } }

	if (type === 'open') {
		r[bldId][mdlOn][chOn] = 1
		r[bldId][mdlOff][chOff] = 0
	}
	if (type === 'close') {
		r[bldId][mdlOn][chOn] = 0
		r[bldId][mdlOff][chOff] = 1
	}
	if (r) setCmd(r)
}

/**
 * Состояние клапана
 * @param {*} vlvId Id Клапана
 * @param {*} value Опрос модулей + анализ
 * @returns
 *  iopn: 'Открывается',
	icls: 'Закрывается',
	opn: 'Открыт',
	cls: 'Закрыт',
	popn: 'Частично открыт',
	alr: 'Неисправность',
 */
function stateV(vlvId, value, buildingId, sectionId) {
	if (!vlvId) return null
	const vlvLim = isExtralrm(buildingId, sectionId, 'vlvLim')
	const vlvLimB = isExtralrm(buildingId, null, 'vlvLim')
	const crash = isExtralrm(buildingId, sectionId, 'vlvCrash' + vlvId)
	const iopn = value?.outputEq?.[vlvId]?.open
	const icls = value?.outputEq?.[vlvId]?.close
	const opn = value?.[vlvId]?.open
	const cls = value?.[vlvId]?.close
	if ((opn && cls) || (iopn && icls) || crash || vlvLim || vlvLimB) return 'alr'
	if (!opn && !cls && !iopn && !icls) return 'popn'
	if (iopn) return 'iopn'
	if (icls) return 'icls'
	if (opn) return 'opn'
	if (cls) return 'cls'
	return null
}

module.exports = {
	ctrlV,
	stateV,
}
