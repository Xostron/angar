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
		// if (bld.type === 'normal') return
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

	// Условия выкл демо:
	// 1. При выключении склада во время демо - выкл демо
	// 2. Демо выключена по кнопке в настройках
	const tt = [!store.retain[idB].start && typeof demo?.cur == 'number', !s?.on]
	if (tt.some(Boolean)) return offDemo(idB, demo)

	// Демо уже в работе - выходим из инициализации
	if (demo?.cur !== null) return
	console.log('INIT DEMO', demo.cur)

	// Первое включение Демо: инициализация
	// Настройки времени каждого этапа
	const t = [s.drying, s.cooling, s.cure, s.heat]
	// Устанавливаем склад в работу по демо:
	// 1. Вкл склад
	store.retain[idB].start = true

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

function offDemo(idB, demo) {
	// Очищаем аккумулятор один раз
	if (demo?.cur === null) return
	console.log('OFF DEMO')
	// Сбрасываем аккумулятор демо
	store.retain[idB].demo = JSON.parse(initDD)
	// Выкл демо в настройках
	store.retain[idB].setting.demo ??= {}
	store.retain[idB].setting.demo.on ??= {}
	store.retain[idB].setting.demo.on.on = false
	// Выкл склад
	store.retain[idB].start = false
}
