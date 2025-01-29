const { ctrlB } = require('@tool/command/fan')
const { data: store, delExtra, wrExtra } = require('@store')

// Нажата кнопка "Сброс аварии"
function reset(building, section, obj, s, se, m, alarm, acc, data, ban) {
	const cur = +new Date().getTime()
	// Нажали на кнопку, выход сброса установится на 3сек
	if (store.reset.has(building._id) || !acc.firstFlag) {
		acc.end = cur + 3000
		acc.firstFlag = true
	}

	// Сброс аварии при потери связи
	connect(obj, building, m, acc, cur)

	// Включить выход
	if (!!acc.end && cur < acc.end) {
		fnReset(m.reset, building, 'on')
	}
	// Выключить выход
	if (!!acc.end && cur >= acc.end) {
		fnReset(m.reset, building, 'off')
		delete acc.end
	}
}
module.exports = reset

// Включение выходов (сброс аварии)
function fnReset(arr, building, type) {
	arr.forEach((el) => {
		ctrlB(el, building._id, type)
	})
}

/**
 * Включение выходов на модулях, которые принадлежат разным секции
 * При отключении данного выхода срабатывает реле безопасности,
 * которое все отключает
 * Реле безопасности у каждой секции
 */

// Если сигнал "Модуль в сети" пропадал, то включаем выход сброса аварии 
function connect(obj, building, m, acc, cur) {
	acc.reset ??= {}
	m.connect.forEach((el) => {
		const sig = obj.value?.[el._id]
		const mdlId = el.module?.id
		const isErr = store.alarm?.module?.[building._id]?.[mdlId]
		if (isErr || !sig) acc.reset[mdlId] = true
		if (sig && acc.reset?.[mdlId]) {
			acc.end = cur + 3000
			acc.firstFlag = true
			delete acc.reset?.[mdlId]
		}
	})
}
