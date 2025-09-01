/**
 * Получить истекшее время
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
	return `${hh}ч ${mm}м`
}


/**
 * Преобразование hh:mm (string) в миллисекунды
 * @param {*} hm hh:mm (string), 01:42
 */
function ms(hm) {
	if (!hm || typeof hm !== 'string') return null
	return hm.split(':').reduce((acc, val, i) => {
		if (i === 0) acc = +val * 60 * 60 * 1000
		if (i === 1) acc += +val * 60 * 1000
		return acc
	}, 0)
}
export { elapsedTime, ms }
