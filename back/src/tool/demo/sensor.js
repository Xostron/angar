const { data: store } = require('@store/index')
const { compareTime, runTimeV2 } = require('@tool/command/time')
const need = ['tprd', 'tcnl', 'hin', 'tout', 'hout']

function senDemo(sens, owner, retain, r) {
	// Владельцы датчика (склад и секция)
	const { building, section } = owner
	// Настройки демо
	const s = store.calcSetting[building._id]?.demo
	// Аккумулятор демо
	const demo = store.retain[building._id].demo
	// Нет склада || демо не активен || демо выключен
	if (!building || demo.cur === null || !s.on || !need.includes(sens.type)) return r

	// Демо в работе
	// Этап
	const stage = demo.stage[demo.cur]
	stage[sens.type].v = change(stage, sens, s)

	return { raw: stage[sens.type].v, value: stage[sens.type].v, state: 'on' }
}

module.exports = { senDemo }

/**
 * Текущее значение датчика
 * @param {*} stage Текщий этап и его условия
 * @returns Показание датчика
 */
function change(stage, sens) {
	const time = compareTime(stage.begin2[stage.i], stage.time / 2)
	if (time) {
		if (++stage.i > 1) stage.i = 1
		stage.begin2[stage.i] = new Date()
	}
	let r
	// Прогресс = нач. знач. - кон. знач. / (всего времени/пройденное время)
	if (stage.i === 0) {
		stage[sens.type].k =
			(stage[sens.type].b[stage.i] - stage[sens.type].a) /
			(stage.time / 2000 / runTimeV2(stage.begin2[stage.i]))
		r = +(stage[sens.type].a + stage[sens.type].k).toFixed(2)
	} else {
		stage[sens.type].k =
			(stage[sens.type].b[stage.i] - stage[sens.type].b[0]) /
			(stage.time / 2000 / runTimeV2(stage.begin2[stage.i]))
		// Текущее значение датчика = нач значение + прогресс
		r = +(stage[sens.type].b[0] + stage[sens.type].k).toFixed(2)
	}

	return r
}
