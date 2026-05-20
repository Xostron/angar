const fnMode = require('./mode')
const checkForce = require('../force')
const { data: store } = require('@store')

/**
 * Шаговое открытие/закрытие приточного клапана
 * @param {*} vlvS клапаны
 * @param {*} idB ИД склада
 * @param {*} idS ИД секции
 * @param {*} retain сохраненные данные склада (настройки и т.д.)
 * @param {*} step принудительно закрыть
 * @param {*} delay принудительно открыть
 */
function ctrlVin(vlvS, idB, idS, retain, forceCls, forceOpn) {
	// Принудительное управление
	if (checkForce(idB, idS, vlvS, forceCls, forceOpn)) return

	// Управление клапаном
	fnMode(vlvS, idB, idS, retain)
}

module.exports = ctrlVin
