const { data: store } = require('@store')

/**
 * Получить режим секции
 * @param {*} idB ИД склада
 * @param {*} idS ИД секции
 * @returns {boolean | undefined | null} Режим секции
 * Режим секции: авто true, ручной false, выкл null|undefined
 */
function getMode(idB, idS) {
	return store.retain?.[idB]?.mode?.[idS]
}

module.exports = { getMode }
