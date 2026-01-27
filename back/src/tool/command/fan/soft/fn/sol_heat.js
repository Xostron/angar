const { compareTime } = require('@tool/command/time')
const { ctrlDO } = require('@tool/command/module_output')
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
 * @returns true - Запрет на вкл ВНО или ПЧ, false - Разрешить
 */
function fnSolHeat(idB, acc, solHeat, on, off, obj, s, where) {
	// Если комби склад в режиме Обычного - выключаем соленоиды подогрева
	if (where !== 'cold') {
		solHeat.forEach((el) => {
			ctrlDO(el, idB, 'off')
		})
		return false
	}

	//
	// Если в системе нет соленоидов подгрева, то разрешаем регулировать ПЧ
	if (!solHeat?.length) {
		acc.sol.value = true
		return false
	}
	// Авария Антидребезг ВНО - разрешаем регулировать по кол-ву ВНО
	if (acc.stable) return false
	// Пока ПЧ не занят, актуализируем его точку отсчета, иначе он стартует со второй скорости
	if (!acc.busy) {
		acc.fc ??= {}
		acc.fc.date = new Date()
	}

	// Команда на включение соленоида подогрева
	if (on) {
		acc.sol.value = true
		// Включаем и ждем (пока ждем запрещаем регулировать ПЧ)
		if (!compareTime(acc.sol.date, acc.delaySolHeat)) {
			acc.busy = false
			return true
		}
		// Время прошло, разрешаем регулировать ПЧ
		return false
	}

	// Команда на выключение соленоида подогрева
	if (off) {
		// console.log(4441, where, '===', 'cold', acc.order, '===', -1, acc.fc.value)
		// Выключение, если все ВНО и ПЧ выключены
		if (where === 'cold' && acc.order === -1 && !acc.fc.value) {
			// Ждем и выключаем соленоид подогрева
			if (!compareTime(acc.sol.date, acc.delaySolHeat)) {
				// console.log(4442, 'ждем...', acc.delaySolHeat)
				acc.busy = false
				return true
			}
			acc.sol.value = false
			// console.log(4442, acc.sol)
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
