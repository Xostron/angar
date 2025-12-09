const { data } = require('@store')

/**
 * Аварии автоматического режима (темп улицы не подходит и т.д.)
 * rs-триггер (приоритет на сброс)
 * @param {*} idB
 * @param {*} sectionId
 * @param {*} automode
 * @param {*} arr {id код аварии, set условие установки аварии, reset условие сброса аварии, msg текст аварии}
 */
function rs(idB, automode, arr) {
	data.alarm.auto ??= {}
	data.alarm.auto[idB] ??= {}
	data.alarm.auto[idB][automode] ??= {}
	if (!arr?.length) return
	const d = data.alarm.auto[idB][automode]

	arr.forEach((o, idx) => {
		if (o.set && !d?.[o.msg.code]) d[o.msg.code] = { id: idx, ...o.msg }
		if (o.reset) delete d[o.msg.code]
	})
}


/**
 * Наличие аварии авторежима
 * @param {*} idB ИД склада
 * @param {*} automode Авторежим
 * @returns {boolean} true - взведена авария авторежима
 */
function isAlr(idB, automode) {
	const d = data.alarm.auto?.[idB]?.[automode] ?? {}
	return Object.keys(d).length ? true : false
}
/**
 * Очистка аккумулятора с авариями
 * @param {*} idB ИД склада
 * @param {*} automode Авторежим
 */
function clearAA(idB, automode) {
	data.alarm.auto[idB] ??= {}
	data.alarm.auto[idB][automode] = {}
}

module.exports = { rs, isAlr, clearAA }
