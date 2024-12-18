const data = require('./data')

/**
 * Абсолютная влажность
 * @param {*} t температура
 * @param {*} q относительная влажность
 * @returns
 */
function calc(t, q) {
	if (t === null || q === null || t === undefined || q === undefined) return null
	if (t <= -30) return (q * data['-30']) / 100
	if (t >= 100) return (q * data[100]) / 100

	let t1 = Math.trunc(t)
	if (t1 > 40) {
		t1 = t1 - (t1 % 5)
	}
	if (t == t1) return +((q * data[t]) / 100).toFixed(1)
	return +((q * lin(t, t1)) / 100).toFixed(1)
}

// Линейная интерполяция
function lin(y, y1) {
	let y2 = y >= 0 ? Math.ceil(y) : Math.floor(y)
	if (y2 > 40) y2 = y2 + 5 - (y2 % 5)
	const x1 = data[y1]
	const x2 = data[y2]
	return (x2 - x1) * (y - y1) + x1
}

module.exports = calc
