const { data: store } = require('@store')
const need = ['tprd', 'tcnl', 'hin', 'p', 'tout', 'hout', 'tin']
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
	// Установки датчика
	stage[sens.type].v = stage[sens.type].v + stage[sens.type].k

	return { raw: stage[sens.type].v, value: stage[sens.type].v, state: 'on' }
}

module.exports = { senDemo }
