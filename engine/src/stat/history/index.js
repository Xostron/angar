const { loggerEvent } = require('@tool/logger')

/**
 * Логирование информационных сообщений
 * @param {object[]} arr массив текущих сообщений
 * @param {object} prev хранилище прошлого значения
 * @param {object} level уровень
 * @param {boolean} force принудительное логирование
 */
function historyLog(arr, prev, level, force) {
	// Логирование новых событий (value: true)
	arr.forEach((el) => {
		const message = { uid: el.uid, bldId: el.buildingId, title: (el.title + ' ' + el.msg).trim(), value: true }
		// Событие было залогировано - выход
		if (el.date === prev[el.uid]?.date && !force) return
		// фиксируем событие как залогированную
		prev[el.uid] = el
		loggerEvent[level]({ message })
	})

	// Логирование ухода аварий (value: false)
	for (const key in prev) {
		const r = arr.find((el) => el.uid == key)
		// авария найдена в списке актуальных - выход
		if (r) continue
		// Авария не найдена в актуальных - авария сброшена
		// (логируем уход аварии, и удаляем из аккумулятора запись об аварии)
		const el = prev[key]
		const message = { uid: el.uid, bldId: el.buildingId, title: (el.title + ' ' + el.msg).trim(), value: false }
		loggerEvent[level]({ message })
		delete prev[key]
	}
}

module.exports = historyLog

