const { flapVlvSig } = require('./output_eq/fn')

/**
 * Состояние заслонки:
 * -обычной
 * -заслонки-клапана
 * @param {*} flap
 * @param {*} signal
 * @param {*} result
 * @returns
 */
function stateFlap(flap, signal, result) {
	const r = {}
	const DO = result?.outputEq?.[flap._id]
	const signals = flapVlvSig(flap, signal)?.signals
	// Авария двигателя
	r.crash = result[signals?.crash?._id]
	// Концевики
	r.opn = result[signals?.opn?._id]
	r.cls = result[signals?.cls?._id]

	// Обычная заслонка
	if (!Object.hasOwn(DO, 'open')) {
		// true - закрыт, false - открыт
		r.state = DO
		if (r.crash) r.state = 'alr'
		return r
	}
	// Заслонка клапан
	// Сигналы управления
	r.open = DO.open
	r.close = DO.close

	r.state = fnState(r)

	return r
}
// Состояние заслонки-клапана
function fnState(r) {
	// Авария
	if ((r.opn && r.cls) || r.crash) return 'alr'
	// Открыта
	if (r.opn || r.open) return 'opn'
	// Закрыта
	if (r.cls || r.close) return 'cls'
	// Частично открыта
	if (!r.opn && !r.cls) return 'popn'
	return null
}

function totalFlap(arrFlap, idClr, result) {
	// true - закрыта заслонка, false - открыта
	return arrFlap.some(
		(el) =>
			result[idClr].flap[el._id].state == 'cls' || result[idClr].flap[el._id].state === true,
	)
}

module.exports = { stateFlap, totalFlap }
