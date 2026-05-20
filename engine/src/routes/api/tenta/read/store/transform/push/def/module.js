const { isErrM } = require('@tool/message/plc_module')

/**
 * Блокировать аварии возникшие из-за неисправности модулей,
 * факт о неисправности модуля определять сразу же как он попал
 * на проверку антидребезга.
 * Т.е. модуль попал в антидребезг из-за неисправности,
 * далее отфильтровываем все аварийные сообщения,
 * которые связаны с данным модулем и заблокировать их отправку на пуши
 * @param {*} idB
 * @param {*} obj Глобальные данные
 * @param {*} r Список аварий для пушей
 */
function fnModule(idB, obj, r) {
	return r.filter((el) => {
		if (!el?.moduleId || !el?.moduleId?.length) return true
		// Для безопасности преобразуем в массив, вдруг el.moduleId строка
		const mdls = el.moduleId instanceof Array ? el.moduleId : [el.moduleId]

		// Проверяем модули на неисправность (isE=true авария)
		const isE = mdls.some((mdl) => isErrM(idB, mdl))
		// Если есть хотя бы один неисправный модуль, удаляем аварию из списка пушей
		return !isE
	})
}

module.exports = fnModule
