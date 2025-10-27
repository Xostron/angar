const def = require('./def')
const { data: store, readAcc } = require('@store')

// Дополнительные аварии авторежимов
function extralrm(building, sect, obj, s, se, m, automode, data, type = 'section', state = 'on') {
	let alr = []
	// console.log('ALARM B')
	for (const key in def[type][state]) {
		// Аккумулятор для хранения промежуточных вычислений (аварий склада)
		const acc = readAcc(building._id, sect?._id ?? 'building', key)
		// Логика
		if (!def?.[type]?.[state]?.[key]) continue
		const r = def[type][state][key](building, sect, obj, s, se, m, automode, acc, data)
		console.log('$$$$$$$$ key', key, r)
		if (r) alr.push(r)
	}
console.log('!!!!!!!!!!!!!alr=',alr)
	return alr.includes(true)
}

module.exports = extralrm
