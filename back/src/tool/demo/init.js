const { data: store } = require('@store/index')
const initDD = require('./init_data')
const { compareTime } = require('@tool/command/time')

/**
 * Инициализация демо
 * @param {*} blds
 */
function fnDemo(blds) {
	blds.forEach((bld) => {
		// Настройки демо
		const s = store.calcSetting[bld._id]?.demo
		startDemo(bld._id, s)
		switchDemo(bld._id, s.on)
	})
}

module.exports = { fnDemo }

/**
 * Инициализация Демо при старте
 * @param {*} idB ИД склада
 * @param {*} s Настройки демо
 * @returns
 */
function startDemo(idB, s) {
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

/**
 * Слежение за временем этапа: переключение этапов и завершение демо
 * @param {*} on Настройки Демо: Включить
 * @param {*} demo Аккумулятор демо
 * @returns
 */
function switchDemo(idB, on) {
	const demo = store.retain[idB].demo
	// Склад выключен
	// Демо выключено - сброс аккумулятора

	if (demo.cur === null) return

	// Демо включено
	// Текущий этап
	const stage = demo.stage[demo.cur]
	// Время
	const time = compareTime(stage.begin, stage.time)
	// Авторежим
	store.retain[idB].automode = stage.automode

	// Время этапа не прошло - работаем дальше
	if (!time) return

	// Время этапа прошло
	// Переключение этапа + проверка "все этапы пройдены"
	if (++demo.cur >= demo.stage.length) {
		store.retain[idB].setting.demo.on.on = false
		store.retain[idB].demo = JSON.parse(initDD)
		store.retain[idB].start = false
		return
	}
	// Следующий этап (инициализация точки отсчета)
	demo.stage[demo.cur].begin = new Date()
	demo.stage[demo.cur].begin2 = [new Date(), null]
	demo.stage[demo.cur].i = 0
}
