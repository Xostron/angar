const { data: store } = require('@store')
const initDD = require('./init_data')
const { compareTime } = require('@tool/command/time')

function revDemo(sens, owner, retain) {
	// Владельцы датчика (склад и секция)
	const { building, section } = owner
	if (!building) return
	const s = store.calcSetting[building._id]?.demo
	// const demo =
	const onSens = retain?.[building._id]?.[sens._id]?.on ?? true

	raw = retain[building._id].demo.stage[curStage]

	return { raw, value, state: state(raw, on) }
}

function demo(blds) {
	blds.forEach((bld) => {
		// Настройки демо
		const s = store.calcSetting[building._id]?.demo

		// Аккумулятор демо
		// store.retain[bld._id].demo ??= initDD
	})
}

module.exports = { demo, revDemo }

// Инициализация аккумулятора Демо при старте
function startDemo(on, demo, s) {
	// Если демо выкл ИЛИ этап демо в работе - выходим
	if (!on || demo?.cur !== null) return
	// Настройки
	const t = [s.drying, s.cooling, s.cure, s.heat]

	// Первичная инициализация и расчет точек перехода по этапам
	store.retain[bld._id].demo = initDD
	const r = store.retain[bld._id].demo
	r.cur = 0
	r.stage.forEach((stage, i) => {
		stage.begin = i === 0 ? new Date() : null
		stage.time = t[i]
	})
}

function stopDemo(on, demo) {
	if (!on) return (demo = initDD)
	const stage = demo.stage[demo.cur]
	const time = compareTime(stage.begin, stage.time)
}
