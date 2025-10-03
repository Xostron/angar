const { data: store } = require('@store')
const { longOpn, longCls } = require('./fn')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
/**
 * Авария клапана: долгое открытие/закрытие
 * @param {*} vlvS Клапаны
 * @param {*} building._id Ссылка на склад
 * @param {*} section Секция
 * @param {*} retain Сохраненные данные склада (текущее положение клапана, время калибровки и т.д.)
 */
function alarmV(building, section, obj, s, se, m, automode, acc, data) {
	const { retain, value } = obj
	for (const v of m.vlvS) {
		acc[v._id] ??= {}

		// Состояние и текущее положение клапана
		const { state, val } = value?.[v._id]

		// Автосброс аварии клапана
		if (acc[v._id]?.finish) {
			acc[v._id] = {}
			delExtralrm(building._id, section._id, 'alrValve')
		}

		// Клапан не в состоянии закрытия/открытия - выходим, очищая аккумулятор
		if (!['iopn', 'icls'].includes(state)) {
			acc[v._id] = {}
			continue
		}

		// гистерезис 2% от времени полного открытия (100% - hystPos - положение клапана,
		//  при котором начинается слежение за долгим открытием/закрытием)
		const hystPos = 2

		// Гистерезис  х% от полного открытия клапан - время ожидания
		const hyst = +((+retain?.[building._id]?.valve?.[v._id] * store.hystV) / 100).toFixed(0)

		const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'

		// Текущий момент времени
		const curTime = +new Date().getTime()

		// Долгое открытие
		if (state === 'iopn') {
			longOpn(building, section, val, v, hyst, hystPos, typeV, curTime, acc)
			continue
		}

		// Долгое закрытие
		if (state === 'icls') {
			longCls(building, section, val, v, hyst, hystPos, typeV, curTime, acc)
			continue
		}

		// Авария клапана
		// if (state === 'alr') {
		// 	acc[v._id].finish = true
		// 	delete acc[v._id].wait
		// 	// ctrlV(v, building._id, 'stop')
		// 	fnMsg(building, section, typeV, 32)
		// 	continue
		// }
	}
}

module.exports = alarmV
