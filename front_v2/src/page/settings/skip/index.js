/**
 * Сравнение объектов (вложенные объекты не поддерживаются)
 * @param {object} eq1
 * @param {object} eq2
 * @param {object[]} Кнопки скрыть/показать: undefined|false - скрыть, true - показать
 * @returns {boolean} true объекты равны
 */
function isEqual(eq1 = {}, eq2 = {}, hh = []) {
	// Объекты разные по размеру ИЛИ нажата ли кнопка скрыть(undefined|false)/показать(true) -> не равны (показывать)
	if (hh?.[1]) return true
	if (Object.keys(eq1).length !== Object.keys(eq2).length) return false
	// Проверка ключ-значение
	for (const key in eq1) {
		if (eq1[key] != eq2?.[key]) return false
	}
	return true
}

export { isEqual }


