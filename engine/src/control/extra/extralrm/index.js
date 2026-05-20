const def = require('./def')
const { data: store, readAcc } = require('@store')

// Дополнительные аварии авторежимов
function extralrm(bld, sect, obj, s, se, m, am, type = 'section', state = 'on') {
	if (!s) return
	let alr = []
	// console.log('ALARM B')
	for (const key in def[type][state]) {
		// Аккумулятор для хранения промежуточных вычислений
		const acc = readAcc(bld._id, sect?._id ?? 'building', key)
		// Логика
		if (!def?.[type]?.[state]?.[key]) continue
		const r = def[type][state][key](bld, sect, obj, s, se, m, am, acc,)
		if (r) alr.push(r)
	}
	return alr.includes(true)
}

module.exports = extralrm
