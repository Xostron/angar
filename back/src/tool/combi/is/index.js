const { isAlr } = require('@tool/message/auto')
const { mech } = require('@tool/command/mech')

/**
 * Склад комби-холод = тип комби-холод && режим хранения &&
 * && Настройка "Испаритель холодильного оборудования" = true &&
 * && Аварии авторежима
 *
 * @param {*} bld
 * @param {*} am
 * @param {*} s
 * @returns {boolean} true - Комби склад в режиме холодильника,
 * 					false - Комби склад в режиме обычного
 */
function isCombiCold(bld, am, s) {
	if (!bld._id || !am || !s) return false
	// Есть ли аварии авторежим (да - разрешение работы холодильника, нет - запрет)
	const alrAuto = isAlr(bld._id, am)
	// Настройка "Испаритель холодильного оборудования" = true/false
	const on = s?.coolerCombi?.on ?? true
	if (bld.type === 'combi' && alrAuto && on && am === 'cooling') return true
	return false
}

/**
 * Данная функция только для блокировки ВНО секции, т.к. по-умолчанию
 * возвращаемое значение = true, это сделано для того чтобы не было блокировки
 * ВНО секций для обычных складов и комби в режиме обычного
 *
 * Для комби склада в режиме холодильника,
 * получаем состояние включены ли вентиляторы у испарителей или нет
 * @param {*} bld Рама склада
 * @param {*} idS ИД секции
 * @param {*} obj Глобальные данные
 * @param {*} bdata Данные склада
 * @returns {boolean} true - ВНО испарителей секции включены, false - все ВНО испарителей выкл.
 */
function isСoolerCombiVNO(bld, idS, obj, bdata) {
	// По-умолчанию ВНО испарителя включены
	let state = true
	// // Если Продукт достиг задания - возврат true, чтобы не было блокировки ВНО секций
	// if (bdata.accAuto.cold?.flagFinish) return state

	if (isCombiCold(bld, bdata?.automode, bdata?.s)) {
		const mS = mech(obj, idS, bld._id)
		// Агрегированное состояние испарителей секций
		state = mS.coolerS.some((clr) => {
			const stateClr = obj?.value?.[clr._id]?.state
			return stateClr === 'off-on-off' || stateClr === 'on-on-off'
		})
		// Если имеется хотя бы один испаритель у которого включен ВНО, то разрешаем работу ВНО
		// console.log(1, 'state', state)
		return state
	}
	return state
}

/**
 * Данная функция только для блокировки ВНО секции, т.к. по-умолчанию
 * возвращаемое значение = true, это сделано для того чтобы не было блокировки
 * ВНО секций для обычных складов и комби в режиме обычного
 *
 * Комби склад в режиме холодильника, при хранении
 * и настройке "Испаритель холодильного оборудования"=false
 * => испарители и ВНО должны выключиться
 * @param {*} bld Рама склада
 * @param {*} bdata Собранные данные
 * @param {*} s Настройки
 * @returns {boolean} false - испаритель выключен
 */
function isCoolerCombiOn(bld, bdata) {
	const { automode, s } = bdata
	//
	let coolerCombiOn = true
	// Есть ли аварии авторежим (да - разрешение работы холодильника, нет - запрет)
	const alrAuto = isAlr(bld._id, automode)
	//
	// if (bld?.type === 'combi' && automode === 'cooling' && alrAuto)
	if (isCombiCold(bld, automode, s))
		coolerCombiOn = s?.coolerCombi?.on ?? true
	//
	console.log(
		'Настройка "Испаритель холодильного оборудования" =',
		s?.coolerCombi?.on,
		coolerCombiOn
	)
	//
	if (coolerCombiOn === false)
		console.log(
			'Комби склад. Испарители и ВНО выключены. Настройка "Испаритель холодильного оборудования" ВЫКЛ'
		)
	return coolerCombiOn
}

module.exports = { isCombiCold, isСoolerCombiVNO, isCoolerCombiOn }
