const { data: store } = require('@store')

/**
 * Для защиты от дребезга выходных модулей
 * @param {*} v Прочитанные данные от модуля
 * @param {*} mdl Рама мо+дуля
 * @return {*} Прочитанные данные с модуля / данные с модуля из кэша
 */
function fnCacheDO(v, mdl) {
	// Для модулей чтения пропускаем проверку
	if (mdl.use === 'r') return v
	if (!mdl?._id) return v
	// Для модулей записи (w), чтения-записи (rw) проверка считанных данных
	if (!v) {
		// Данные ошибочны - возвращаем кэш
		console.log(mdl.name, mdl.ip, 'Данные взяты из кэша')
		return store?.cacheDO?.[mdl._id]
	}
	// Данные ОК, обновляем кэш
	store.cacheDO[mdl._id] = v
	console.log(mdl.name, mdl.ip, 'Данные с модуля')
	return v
}

module.exports = fnCacheDO
