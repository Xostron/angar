/**
 * Посчитать истекшее время
 * @param {*} date Дата отсчета
 * @returns 'HH:mm'
 */
function elapsedTime(date) {
	if (!date) return null
	const cur = new Date().getTime()
	const d = new Date(date).getTime()
	// время в минутах
	const r = (cur - d) / 60000
	// часы
	const hh = +(r / 60).toFixed(0) < 10 ? '0' + (r / 60).toFixed(0) : (r / 60).toFixed(0)
	// мин
	const mm = +(r % 60).toFixed(0) < 10 ? '0' + (r % 60).toFixed(0) : (r % 60).toFixed(0)
	// console.log(111, `${hh}:${mm}`)
	return `${hh}ч ${mm}м`
}

export { elapsedTime }
