/**
 * Фиксируем показание датчика в аккумуляторе
 * @param {*} code Ключ
 * @param {object} v Стейт датчика
 * @param {*} acc Аккумулятор демо
 */
function stasis(code, v, acc) {
	if (acc?.[code] === undefined || acc?.[code].value === null) acc[code] = v
}

function getIdSbyClr(idClr, obj) {
	return obj.data.cooler.find((el) => el._id === idClr)
}

// Среднее арифметическое по давлению
function fnMean(demo) {
	const arrV = Object.values(demo.accF.p)
	let n = 0
	let mean = 0
	for (const v of arrV) {
		if (typeof v.value != 'number') continue
		n++
		mean += v.value
	}
	return n > 0 ? +(mean / n).toFixed(0) : null
}

module.exports = { stasis, getIdSbyClr, fnMean }
