const { ctrlV } = require('@tool/command/module_output')
const { data: store } = require('@store')

/**
 * Проверка принудительного управления клапанами
 * @param {*} idB ИД склада
 * @param {*} vlvS Клапаны секции
 * @param {*} forceCls Принудительное закрытие
 * @param {*} forceOpn Принудительное открытие
 * @returns {boolean} false - Принудительного упр. выключено (Разрешить шаговое управление)
 * true - Принудительного упр. включено (Запретить шаговое управление)
 */
function checkForce(idB, idS, vlvS, forceCls, forceOpn) {
	// Принудительное ВЫКЛ
	if (!forceCls && !forceOpn) return false

	// Принудительное ВКЛ
	store.aCmd ??= {}
	store.aCmd[idS] ??= {}
	store.aCmd[idS].vlv = null
	for (const vlv of vlvS) {
		store.watchdog ??= {}
		store.watchdog[vlv._id] = null
		if (forceCls) ctrlV(vlv, idB, 'close')
		else ctrlV(vlv, idB, 'open')
	}
	return true
}

module.exports = checkForce
