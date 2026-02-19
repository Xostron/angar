const { data: store } = require('@store')
const mes = require('@dict/message')
const { isErrMs } = require('@tool/message/plc_module')

// Критические аварии (всплывающие окна)
function banner(r, bld, sect, am) {
	// Управление переведено на переключатели на щите
	r.banner.local ??= {}
	r.banner.local[bld._id] ??= {}
	r.banner.local[bld._id][sect._id] = store.alarm?.extralrm?.[bld._id]?.[sect._id]?.local ?? null
	// Авария питания
	r.banner.supply ??= {}
	r.banner.supply[bld._id] ??= {}
	r.banner.supply[bld._id][sect._id] =
		store.alarm?.extralrm?.[bld._id]?.[sect._id]?.supply ?? null
}

function bannerB(r, bld) {
	// Управление переведено на переключатели на щите
	r.banner.local ??= {}
	r.banner.local[bld._id] ??= {}
	r.banner.local[bld._id][bld._id] = store.alarm?.extralrm?.[bld._id]?.local ?? null
	// Обратитесь в сервисный центр (пропала связь с модулем)
	r.banner.connect ??= {}
	r.banner.connect[bld._id] = isErrMs(bld._id) ? mes[28] : null
	// Склад не работает: требуется калибровка клапанов
	r.banner.notTune ??= {}
	r.banner.notTune[bld._id] = store.alarm?.extralrm?.[bld._id]?.notTune
	// Авария питания. Ручной сброс
	r.banner.battery ??= {}
	r.banner.battery[bld._id] = store.alarm?.extralrm?.[bld._id]?.battery
	// Авария питания
	r.banner.supply ??= {}
	r.banner.supply[bld._id] ??= {}
	r.banner.supply[bld._id][bld._id] = store.alarm?.extralrm?.[bld._id]?.supply ?? null
	// Нажата кнопка выключения склада
	r.banner.bldOff ??= {}
	r.banner.bldOff[bld._id] = store.alarm?.extralrm?.[bld._id]?.bldOff
}

module.exports = { banner, bannerB }
