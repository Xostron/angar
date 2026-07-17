const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store/index')
const initDD = require('./init_data')

/**
 * Слежение за временем этапа: переключение этапов и завершение демо
 * @param {*} on Настройки Демо: Включить
 * @param {*} demo Аккумулятор демо
 * @returns
 */
function normal(idB, on) {
	const demo = store.retain[idB].demo
	// Демо выключено
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

module.exports = normal