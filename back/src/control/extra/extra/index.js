const def = require('./def')
const { data: store, readAcc } = require('@store')

// Дополнительные функции авторежимов
function extra(
	building,
	section,
	obj,
	s,
	se,
	m,
	alarm,
	resultFan,
	data,
	type = 'section',
	state = 'on'
) {
	if (!s) return
	for (const key in def[type][state]) {
		// Аккумулятор для хранения промежуточных вычислений доп функций
		let code = key
		if (key === 'coOn' || key === 'coAuto' || key === 'co2NormalCombi') code = 'co2'
		else code = key
		const acc = readAcc(building._id, section?._id ?? 'building', code)
		if (key === 'coOn' || key === 'coAuto' || key === 'co2NormalCombi')
			console.log(2200, 'EXTRAAAAAAAAA', key, code, alarm, resultFan)
		// Таймер запретов TODO вентиляция, увлажнитель
		let ban = store.alarm.timer?.[building._id]?.[key]
		if (key === 'accelOn' || key === 'accelAuto') ban = store.alarm.timer?.[building._id]?.accel
		else if (key === 'coOn' || key === 'coAuto' || key === 'co2NormalCombi')
			ban = store.alarm.timer?.[building._id]?.co2
		def[type][state][key](building, section, obj, s, se, m, alarm, acc, data, ban, resultFan)
	}
}

// Процедуры очистки для функций extra (пользовательски, например, очистить аккумулятор или очистить сообщение)
function extraClear(
	building,
	section,
	obj,
	s,
	se,
	m,
	alarm,
	resultFan,
	data,
	type = 'section',
	state = 'on'
) {
	for (const key in def[type][state]) {
		def[type][state][key](
			building,
			section,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			true
		)
	}
}

module.exports = { extra, extraClear }
