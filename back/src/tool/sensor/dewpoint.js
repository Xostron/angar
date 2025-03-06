/**
 * Точка росы
 * https://poliol.ru/cont/articles/3-sposoba-rascheta-tochki-rosy-pri-uteplenii-pomeshcheniya/
 * @param {number} [h=50] Температура, С
 * @param {number} [t=25] Влажность,%
 * @returns
 */
function dewpoint(t, h) {
	if (typeof t != 'number' || typeof h != 'number') return null
	const q = 17.27
	const b = 237.7
	const f = (q * t) / (b + t) + Math.log(h / 100)
	const r = +((b * f) / (q - f))?.toFixed(1)
	return Number.isNaN(r) ? null : r
}
module.exports = dewpoint
