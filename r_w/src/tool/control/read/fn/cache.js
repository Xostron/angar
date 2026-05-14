const { data: store } = require('@store')

/**
 * Для защиты от дребезга выходных модулей
 * @param {*} v Прочитанные данные от модуля
 * @param {*} mdl Рама модуля
 * @return {*} Прочитанные данные с модуля / данные с модуля из кэша
 */
function fnCacheDO(v, mdl) {
	// Модули входов - пропускаем (КЭШ не предусмотрен)
	if (mdl.use === 'r') return v
	
	// Для модулей записи (w), чтения-записи (rw)
	// Если данные с модуля не прочитаны - вернуть КЭШ
	if (!v) {
		console.log(mdl.name, mdl.ip, 'Данные взяты из кэша')
		return store?.cacheDO?.[mdl.ip]
	}
	
	// Данные с модуля - успешно прочитаны, обновляем кэш, возврат
	store.cacheDO[mdl.ip] = v
	console.log(mdl.name, mdl.ip, 'Данные с модуля')
	return v
}

module.exports = fnCacheDO
