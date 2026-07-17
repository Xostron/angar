const { data: store } = require('@store/index')
const initDD = require('./init_data')
const { compareTime } = require('@tool/command/time')
const def = require('./def/index')

/**
 * Инициализация демо
 * @param {*} blds
 */
function fnDemo(blds) {
	blds.forEach((bld) => {
		// TODO убрать когда будет готова реализация демо для холодильника и комби
		if (bld.type !== 'normal') return
		// Настройки демо
		const s = store.calcSetting[bld._id]?.demo
		initDemo(bld._id, s)
		def[bld.type](bld._id, s.on)
	})
}

module.exports = { fnDemo }

/**
 * Инициализация Демо при старте
 * @param {*} idB ИД склада
 * @param {*} s Настройки демо
 * @returns
 */
function initDemo(idB, s) {
	// Инициализация аккумулятора демо
	store.retain[idB].demo ??= JSON.parse(initDD)
	const demo = store.retain[idB].demo

	// При выключении склада во время демо - сбрасываем и выкл демо
	if (!store.retain[idB].start && store.retain[idB].demo.first) {
		store.retain[idB].demo = JSON.parse(initDD)
		store.retain[idB].setting.demo.on.on = false
		return
	}

	// Если демо выключена - выходим
	if (!s?.on) return (store.retain[idB].demo = JSON.parse(initDD))
	// демо уже в работе - выходим
	if (demo?.cur !== null) return

	// Если демо только включили
	// Настройки времени каждого этапа
	const t = [s.drying, s.cooling, s.cure, s.heat]
	// При включении демо -> вкл склад
	if (!demo.first) {
		demo.first = true
		store.retain[idB].start = true
	}
	// Устанавливаем номер начального этапа
	demo.cur ??= 0
	// Расчет времени начала первого этапа и продолжительность для всех этапов
	demo.stage.forEach((stage, i) => {
		stage.begin = i === 0 ? new Date() : null
		stage.begin2 = i === 0 ? [new Date(), null] : [null, null]
		stage.time = t[i]
		stage.i ??= 0
		for (const key in stage) {
			if (['name', 'automode', 'begin', 'begin2', 'time', 'i'].includes(key)) continue
			const demoS = stage[key]
			// Начальное значение датчика
			demoS.v = demoS.a
		}
	})
}
