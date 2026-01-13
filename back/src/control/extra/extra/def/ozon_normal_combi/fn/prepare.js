const { delExtra, wrExtra } = require('@tool/message/extra')
const { getIdsS } = require('@tool/get/building')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')
const { collect } = require('@tool/smoking_ozon/fn')

function fnPrepare(bld, obj, s, m) {
	// id всех секций данного склада
	const idsS = getIdsS(obj.data.section, bld._id)
	// Настройки окуривания
	const stg = s?.ozon
	// Аккумулятор окуривания
	const oacc = obj.retain?.[bld._id]?.ozon ?? {}
	store.ozon[bld._id] = oacc
	// Настройка режим работы разгонного вент
	const accelMode = s.coolerCombi?.accel ?? s.accel?.mode
	// Рабочие ВНО по секциям
	const fan = collect(bld._id, idsS, obj, stg)
	// Разгонные ВНО
	const fanA = m.fanA ?? []
	// Устройства озонаторы
	// Готовность работы озонаторов (есть ли хотя бы один рабочий озонатор)
	const oz = getOzon(bld, obj, m)
	return { oacc, oz, fanA, fan, accelMode, stg, idsS }
}

module.exports = { fnPrepare, getOzon }
/**
 * Есть ли рабочие озонаторы со включенным автоматом
 * @param {*} bld
 * @param {*} obj
 * @param {*} m
 * @returns {object} {object[], boolean} arr - массив озонаторов, ready - общий сигнал готовности
 */
function getOzon(bld, obj, m) {
	const ready =
		m.ozon.some((el) => {
			// Рама beep "Автомат выключен"
			// const off = el.beep.find((e) => e.code === 'off')
			// Состояние данного сигнала (по-умолчанию ОК)
			const st = obj.value[el._id]?.beep?.off?.value ?? true
			return st
		}) && !!m.ozon.length
	let reason = m.ozon.length > 1 ? 'выключены автоматы' : 'выключен автомат'
	reason = !!m.ozon.length ? reason : null
	// Если озонаторы неисправны
	if (!ready && reason !== null)
		wrExtra(bld._id, null, 'ozon3', msgB(bld, 91, `Не готов. По причине: ${reason}`))
	else delExtra(bld._id, null, 'ozon3')
	return { arr: m.ozon, ready }
}
