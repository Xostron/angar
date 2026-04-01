/**
 * Внешняя функция
 * @param  {number | string} hold Значения настроек исходные (замыкание)
 * @returns Внутрення функция
 * Внутрення функция
 * @param  {number | string} cur Значения настроек в цикле (текущие)
 * @returns {boolean} true - настройки изменены, false - настройки идентичны
 */
function isChange(...hold) {
	return (...cur) => {
		const holding = hold.join(' ')
		const current = cur.join(' ')
		return holding !== current
	}
}

module.exports = isChange
