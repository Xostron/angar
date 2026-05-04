const { msgV } = require('@tool/message')
const { getSignal, getSig } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { getMode } = require('@tool/retain/get')

// Нет питания электродвигателя клапана
function vlvCrash(building, section, obj, s, se, m, automode, acc, data) {
	// По клапанам
	for (const v of m.vlvAll) {
		acc[v._id] ??= {}
		// Значение сигнала: авария двигателя
		const sig = getSignal(v?._id, obj, 'vlvCrash')
		const moduleId = getSig(v?._id, obj, 'vlvCrash')?.module?.id
		const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'

		// Сброс
		if (!sig) {
			delExtralrm(building._id, 'vlvCrash', v._id)
			acc[v._id]._alarm = false
		}
		// Установка
		if (sig && !acc[v._id]._alarm) {
			wrExtralrm(building._id, 'vlvCrash', v._id, msgV(building, section, typeV, 34), [
				moduleId,
			])
			acc[v._id]._alarm = true
		}
	}
	// Если авария приточного клапана, то выключаем весь склад
	const alr = isAlr(building._id, m.vlvAll, acc, obj.retain)

	return alr
}

module.exports = vlvCrash

/**
 * Если авария приточного клапана, то выключаем весь склад, с учетом если секция в авто
 * @param {*} vlv Клапаны
 * @param {*} acc Аккумулятор
 * @returns true - авария
 */
function isAlr(idB, vlv, acc, retain) {
	const alr = vlv
		.filter((el) => el.type === 'in')
		.some((el) => acc?.[el._id]?._alarm && getMode(idB, el.sectionId))
	return alr
}
