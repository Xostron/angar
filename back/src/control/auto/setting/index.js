const { getSensor } = require('@tool/command/sensor')
const { fill, cb } = require('./fn')
const { debugJson } = require('@tool/json')

function setting(bld, obj) {
	const { retain, factory } = obj
	const codeP = retain?.[bld._id]?.product?.code
	// список настроек склада
	const kind = bld?.kindList
	const r = {}
	// по настройкам склада
	for (const key of kind) {
		const isPrd = factory[key]?._prd
		fill(r, retain?.[bld._id]?.setting?.[key], factory?.[key], cb, key, codeP, isPrd)
	}
	r.sys??={}
	r.sys.cf = coef(r.sys, bld, obj)

	// Готовые настройки на сервере (для проверки)
	// debugJson({ newnew: r }, ph.resolve(__dirname))

	return r
}

module.exports = setting

// Коэффициенты системных настроек
function coef(stg, bld, obj) {
	const { value, data } = obj
	// Температура улицы (мин)
	const tout = value?.total?.tout?.min

	// Множитель открытия в % для выпускного клапана: %Out = %In(приточ. клап.) * kOut
	const hyst = 1
	let kOut = stg?.outDefault
	if (tout < stg?.out1?.temp || tout - hyst < stg?.out1?.temp) kOut = stg?.out1?.k
	if (tout < stg?.out2?.temp || tout - hyst < stg?.out2?.temp) kOut = stg?.out2?.k
	if (tout < stg?.out3?.temp || tout - hyst < stg?.out3?.temp) kOut = stg?.out3?.k

	// Множитель импульсов для приточного клапана 5сек * kIn = 15сек откр/закр
	let kIn = 3
	if (tout >= 4) kIn = 3
	if (tout + hyst < 4) kIn = 1

	return { kOut, kIn }
}
