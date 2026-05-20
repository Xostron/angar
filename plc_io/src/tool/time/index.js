function delay(time = 0) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, time, !time ? false : true)
	})
}

/**
 * Проверка на пройденное время, true - время прошло
 * @param {String | DateTime} t дата и время (начальная точка)
 * @param {Integer} d заданное время, мс
 * @returns {Boolean} true - время истекло
 */
function compareTime(t, d) {
	try {
		if (!t) return false
		if (typeof t === 'string') t = new Date(t)
		const now = new Date()
		return now - t >= d
	} catch (error) {
		console.log('compareTime', error)
		return true
	}
}

module.exports = { delay, compareTime }
