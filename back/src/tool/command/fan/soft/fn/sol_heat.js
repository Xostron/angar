const { compareTime } = require('@tool/command/time')

//
//
/**
 * Логика соленоид подогрева
 * @param {object} acc
 * @param {object[]} solHeat соленоиды подогрева
 * @param {boolean} on сигнал на включение (функция defOnOff) по температуре канала
 * @param {boolean} off сигнал на выключение (функция defOnOff) по температуре канала
 * @param {object} s Настройки (web Страница Настройки)
 * @param {string} where normal - обычный склад, комби склад в режиме обычного склада
 * 					cold - комби склад в режиме холодильника
 * @returns true - 1 этап соленоид подогрева, false - 1 этап пройден
 */
function fnSolHeat(acc, solHeat, on, off, s, where) {
	// Если комби склад в режиме
	if (where != 'cold') return false
	// Если в системе нет соленоидов подгрева, то разрешаем регулировать ПЧ
	if (!solHeat?.length) return false
	// Авария Антидребезг ВНО - разрешаем регулировать по кол-ву ВНО
	if (acc.stable) return false
	// Пока ПЧ не занят, актуализируем его точку отсчета, иначе он стартует со второй скорости
	if (!acc.busy) acc.fc.date = new Date()

	// Включаем соленоид
	if (on) {
		acc.sol.value = true
		// включаем и ждем (пока ждем запрещаем регулировать ПЧ)
		if (!compareTime(acc.sol.date, acc.delaySolHeat)) {
			acc.busy = false
			return true
		}
		// Время прошло, разрешаем регулировать ПЧ
		return false
	}

	// Выкл соленоид, если все остальное выключено
	if (off) {
		// Выключение, если все ВНО и ПЧ выключены
		if (where == 'cold' && acc.order === -1 && acc.fc.sp < s.fan.min) {
			// Ждем и выключаем соленоид подогрева
			if (!compareTime(acc.sol.date, acc.delaySolHeat)) {
				acc.busy = false
				return true
			}
			acc.sol.value = false
		}
		// Сигнал на выключение есть, но условия для отключения соленоида подогрева не наступили
		// Обновляем точку отсчета отключения соленоида подгрева
		acc.sol.date = new Date()
		// Разрешаем регулировать ПЧ
		return false
	}
	// Обновляем точку отсчета отключения соленоида подгрева
	acc.sol.date = new Date()
	// По-умолчанию, если имеются соленоиды подогрева запрещаем регулировать ПЧ
	if (solHeat?.length) return true
}

module.exports = fnSolHeat
