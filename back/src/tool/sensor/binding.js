const { getBS } = require('@tool/get/building')
const { debounce } = require('./debounce')
const { valid, webSensAlarm } = require('./fn')
const { data: store } = require('@store')

function fnBindingAI(equip, val, retain, result) {
	const { building, binding } = equip
	const ai = binding.filter((el) => el.type === 'ai')
	ai.forEach((s) => {
		const own = equip?.[s.owner.type].find((el) => el._id === s.owner.id)
		const owner = getBS(own, equip)
		// Исправность, округление датчика
		const r = valid(s, owner, val, equip, retain)

		// антидребезг датчика
		const hold = debounce(owner?.building?._id, s._id, r, store.holdSensor?.[s._id], retain, s)
		result[s._id] = hold ? hold : r

		// Аварийные сообщения датчика
		webSensAlarm(result[s._id], owner?.building, owner?.section, s)
		// Обновляем прошлое значение
		store.holdSensor[s._id] = result?.[s._id]
	})
}

module.exports = fnBindingAI
