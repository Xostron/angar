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
