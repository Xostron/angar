/**
 * Обновление аккумулятора - пересечение данных файла (data) и данных итерации (obj) (по ключам)
 * Данные из файла копируются в obj (только пересечения)
 * Затем obj сохраняется в файл
 * @param {*} obj Данные итерации
 * @param {*} data Данные файла
 * @returns
 */
function cbAcc(obj, data) {
	// Проход по ключам аккумулятора (extralrm, extra, timer, auto ...)
	for (const key in obj) {
		if (key === 'achieve') continue
		// Запись пересечений obj c data
		all(obj[key], data[key])
	}
	const newO = { ...obj }
	delete newO?.achieve
	// delete obj?.achieve
	return newO
}

/**
 * obj - новые аварии, data - сохраненые аварии
 * Поиск пересечения между двумя объектами, результат мутированный obj,
 * в котором пересечения копируются из data
 * @param {*} data данные из файла (слудующая вложенность)
 * @param {*} obj данные из итерации (следующая вложенность)
 * @param {*} prev данные из итерации (предыдущая вложенность)
 * @param {*} key предыдущий ключ
 * @returns
 */
function all(obj = {}, data = {}, prev, key) {
	const keys = Object.keys(obj)
	for (const k of keys) {
		// Ключ есть в файле (пересечение obj c data)
		if (k in data) {
			if (typeof obj[k] !== 'object') {
				// console.log(555, key, prev, data)
				prev[key] = data
				return
			}
			// console.log(444, k, obj)
			all(obj[k], data[k], obj, k)
		}
	}
}

module.exports = cbAcc