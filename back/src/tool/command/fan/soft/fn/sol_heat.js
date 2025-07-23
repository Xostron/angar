const { compareTime } = require('@tool/command/time')

// Соленоид подогрева
function fnSolHeat(acc, solHeat, on, off, s, where) {
	if (!solHeat?.length) return false
	// Авария Антидребезг ВНО - разрешаем регулировать по кол-ву ВНО
	if (acc.stable) return false
	// Работает только в комби складе в режиме холодильник
	if (where != 'cold') return false
	// Время ожидания следующего шага
	let time = s.fan.next * 1000
	// Включаем соленоид
	if (on) {
		acc.sol.value = true
		if (!compareTime(acc.sol.date, time)) return true
		return false
	}

	// выкл соленоид, если все остальное выключено
	if (off) {
		if (where == 'cold' && acc.order === -1 && acc.fc.sp < s.fan.min) {
			acc.sol.value = false
			acc.sol.date = new Date()
			return false
		}
	}
	return false
}

module.exports = fnSolHeat
