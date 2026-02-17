const { isAlr } = require('@tool/message/auto')
const { mech } = require('@tool/command/mech')
const { isAllStarted } = require('@store/index')
const { data: store } = require('@store')
const { getStateVNOClr } = require('@tool/cooler')

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
 * @returns {boolean} true - ВНО испарителей секции разрешены, false - все ВНО испарителей запрещены.
 */
function isСoolerCombiVNO(bld, idS, obj, bdata) {
	// По-умолчанию ВНО испарителя включены
	let state = true
	// Если температура канала низкая и включены все механизмы подогрева,
	// то выключаем испарители, при этом при выключенных испарителях,
	// здесь происходит блокировка ВНО секции, но их не нужно в этой ситуации блокировать
	if (isAllStarted(idS)) {
		// кол-во пропускаемых циклов = 2
		store.cycle.ccVno[idS] = new Date()
		return true
	}
	// Если Продукт достиг задания - возврат true, чтобы не было блокировки ВНО секций
	if (bdata.accAuto.cold?.flagFinish) return true

	if (isCombiCold(bld, bdata?.automode, bdata?.s)) {
		state = getStateVNOClr(idS, obj)
		// Задержка инертности включения испарителя, после isAllStarted
		if (state) delete store.cycle.ccVno?.[idS]
		// Если имеется хотя бы один испаритель у которого включен ВНО, то разрешаем работу ВНО
		// console.log(1, 'state', state, store.cycle.ccVno[idS])
		return state || store.cycle.ccVno?.[idS]
	}
	return true
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
	if (isCombiCold(bld, automode, s)) coolerCombiOn = s?.coolerCombi?.on ?? true
	//
	if (coolerCombiOn === false)
		console.log(
			'Комби склад. Испарители и ВНО выключены. Настройка "Испаритель холодильного оборудования" ВЫКЛ',
		)
	return coolerCombiOn
}

module.exports = { isCombiCold, isСoolerCombiVNO, isCoolerCombiOn }
