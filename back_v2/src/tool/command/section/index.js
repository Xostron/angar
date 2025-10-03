const def = require('@control/main/def/normal/def')
const { data: store } = require('@store')
const { isAlr } = require('@tool/message/auto')

/**
 * Разрешение на работу секции обычного склада
 * @param {*} buildingId Текущий склад
 * @param {*} section Секция
 * @returns
 */
function check(buildingId, section, obj, automode, start) {
	// Склад не включен
	if (!start) return false
	// Не найдена функция с авторежимом
	if (!def[automode]) return false
	// Секция не в авторежиме
	if (!obj.retain?.[buildingId]?.mode?.[section._id]) return cb()
	// Не пройдена подготовка секции к авторежиму
	if (!store.toAuto?.[buildingId]?.[section._id]) return cb()
	// Все ок!
	return true
}

// сброс аварий
function cb(buildingId, sectionId) {
	return false
}

module.exports = { check }
