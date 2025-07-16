const { isExtralrm } = require('@tool/message/extralrm')

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
	stateV
}
