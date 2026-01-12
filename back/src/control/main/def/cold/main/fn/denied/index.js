const { data: store } = require('@store')
const checkSupply = require('../supply')
const { isReadyAgg, clear, clearCombi } = require('./fn')
const { isAlr } = require('@tool/message/auto')
const { clearAchieve } = require('@tool/message/achieve')
const { isExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
/**
 * @description Склад Холодильник: Запрет работы испарителя
 * @param {object} bld Склад
 * @param {object} bdata Данные для конкретного склада
 * @param {boolean} alr Аварии extralrm
 * @param {string} stateCooler Состояние испарителя
 * @param {function} fnChange Замыкание - функция для изменения состояния испарителя
 * @returns {boolean} true - запрет работы, false - разрешено
 */
function deniedCold(bld, sect, clr, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto, supply } = bdata
	store.denied[bld._id] ??= {}

	const supplySt = checkSupply(supply, bld._id, clr._id, obj.retain)
	const aggr = isReadyAgg(obj.value, bld._id, clr._id)

	store.denied[bld._id][clr._id] =
		!start || alr || !aggr || !supplySt || stateCooler?.status === 'alarm'
	// console.log(410, clr.name, sect.name, 'работа запрещена', store.denied[bld._id][clr._id])
	// console.log('\tНеисправность модулей испарителя', stateCooler?.status === 'alarm')
	clearAchieve(bld, obj, accAuto, false, start)

	// Работа испарителя запрещена?
	// Нет
	if (!store.denied[bld._id][clr._id]) return false
	// Да
	clear(bld._id, clr, accAuto, fnChange, stateCooler, store)
	// console.log('\tОстановка из-за ошибок:')
	// console.log('\t\tСклад остановлен:', !start)
	// console.log('\t\tАвария:', alr)
	// console.log('\t\tАгрегат готов к работ', aggr)
	// console.log('\t\tОжидание после включения питания', !supplySt)

	return true
}

// Склад Комби: Запрет работы испарителя
function deniedCombi(bld, sect, clr, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto, supply, automode } = bdata
	store.denied[bld._id] ??= {}
	// Проверка питания
	const supplySt = checkSupply(supply, bld._id, clr._id, obj.retain)
	// Готов ли агрегат
	const aggr = isReadyAgg(obj.value, bld._id, clr.aggregateListId)
	// Есть ли аварии авторежим (да - разрешение работы холодильника, нет - запрет)
	const alrAuto = isAlr(bld._id, automode)
	// Выведен ли из работы ВНО испарителя
	const fansOff = clr.fan.some((el) => obj.retain?.[bld._id]?.fan?.[sect._id]?.[el._id])
	// Местный режим секции
	const idsS = getIdsS(obj.data.section, bld._id)
	const local =
		isExtralrm(bld._id, null, 'local') || idsS.some((idS) => isExtralrm(bld._id, idS, 'local'))
	// Режим секции true-Авто
	const sectM = obj.retain?.[bld._id]?.mode?.[sect._id]
	// Настройка "Испаритель холодильного оборудования" = true/false
	const off = (s?.coolerCombi?.on ?? true) === false
	const alrStop = isExtralrm(bld._id, null, 'alarm')
	const alrClosed =
		isExtralrm(bld._id, null, 'alrClosed') ||
		idsS.some((idS) => isExtralrm(bld._id, idS, 'alrClosed'))
	store.denied[bld._id][clr._id] =
		!start ||
		alr ||
		!aggr ||
		!supplySt ||
		!store.toAuto?.[bld._id]?.[sect._id] ||
		!alrAuto ||
		automode != 'cooling' ||
		fansOff ||
		// TODO Авария ВНО испарителя
		stateCooler.fan.state === 'alarm' ||
		local ||
		!sectM ||
		stateCooler?.status === 'alarm' ||
		off ||
		alrStop ||
		alrClosed
	console.log(410, clr.name, sect.name, 'работа запрещена combi', store.denied[bld._id][clr._id])
	// console.log(
	// 	'\t',
	// 	'start',
	// 	!start,
	// 	'alr',
	// 	alr,
	// 	'aggr',
	// 	!aggr,
	// 	'supplySt',
	// 	!supplySt,
	// 	'!store.toAuto?.[bld._id]?.[sect._id]',
	// 	!store.toAuto?.[bld._id]?.[sect._id],
	// 	'!alrAuto',
	// 	!alrAuto,
	// 	'automode != cooling',
	// 	automode != 'cooling',
	// 	'fansOff',
	// 	fansOff,
	// 	'stateCooler.fan.state === alarm',
	// 	stateCooler.fan.state === 'alarm',
	// 	'local',
	// 	local,
	// 	'!sectM',
	// 	!sectM,
	// 	'stateCooler?.status === alarm',
	// 	stateCooler?.status === 'alarm',
	// 	'alrStop',
	// 	alrStop,
	// 	'alrClosed',
	// 	alrClosed
	// )
	// Работа испарителя запрещена? false - Нет.
	if (!store.denied[bld._id][clr._id]) return false

	// true - Да (очищаем аккумулятор по испарителю и выключаем его)
	clearCombi(bld._id, clr, s, accAuto, fnChange, stateCooler, store, alrAuto, sectM)

	console.log('\tОстановка из-за ошибок:', store.denied[bld._id][clr._id])
	// console.log('\t\tСклад в работе:', start)
	// console.log('\t\tНет аварий комбинированного склада:', !alr)
	// console.log('\t\tАгрегат готов к работе', aggr)
	// console.log('\t\tОжидание после включения питания пройдено', supplySt)
	// console.log('\t\tСекция в Авто', sectM)
	// console.log('\t\tПодготовка секции к авто пройдена', store.toAuto?.[bld._id]?.[sect._id])
	// console.log('\t\tАвария авторежима активна, можно работать', alrAuto)
	// console.log('\t\tСклад в режиме Хранения', automode == 'cooling')

	return true
}

// Отключение запрещенных к работе испарителей с проверкой на дублирование ВНО
function offDenied(idB, mS, s, fnChange, accAuto, alrAuto, sectM) {
	const couple = coupleClr(mS)
	// Итог по всем испарителям (для полной очистки аккумулятора секции)
	const allDeniedSect = []
	// Проходим по парам испарителей и одиночкам
	couple.forEach((pair) => {
		const denied = []
		if (!pair?.length) return
		// 1. Если один испаритель в паре, то просто выключаем при запрете работы
		if (pair.length < 2 && store?.denied?.[idB]?.[pair[0]]) {
			allDeniedSect.push(store?.denied?.[idB]?.[pair[0]])
			const clr = mS.coolerS.find((el) => el._id === pair[0])
			if (!clr) return
			if (
				!alrAuto ||
				sectM === false ||
				s?.smoking?.on ||
				s?.ozon?.on ||
				!s?.coolerCombi?.on
			) {
				fnChange(0, null, 0, 0, null, clr)
			} else fnChange(0, 0, 0, 0, null, clr)
			return
		}
		// 2. Для парных испарителей (1 ВНО на двоих и более испарителей)
		pair.forEach((idClr) => {
			denied.push(store?.denied?.[idB]?.[idClr])
		})
		allDeniedSect.push(...denied)
		// Частичное или Полное отключение пары испарителей
		// 2.1. Полное отключение пары
		if (denied.every((el) => el)) {
			// Испаритель запрещен к работе, но ВНО испарителя не блокируется при:
			// 1. в режиме обычного склада (нет аварий авторежима)
			// 2. Секция в ручном режиме
			// 3. Включено окуривание
			// 4. выключено оборудование испарителя
			pair.forEach((idClr) => {
				const clr = mS.coolerS.find((el) => el._id === idClr)
				if (
					!alrAuto ||
					sectM === false ||
					s?.smoking?.on ||
					s?.ozon?.on ||
					!s?.coolerCombi?.on
				) {
					fnChange(0, null, 0, 0, null, clr)
				} else fnChange(0, 0, 0, 0, null, clr)
			})
			return
		}
		// 2.2. Частичное отключение пары
		denied.forEach((el, i) => {
			// Если разрешен к работе не отключаем
			if (el === false) return
			// Запрещен - отключаем
			const idClr = pair[i]
			const clr = mS.coolerS.find((el) => el._id === idClr)
			fnChange(0, null, 0, 0, null, clr)
		})
	})

	// Полная очистка секции (Все испарители секции запрещены)
	// console.log('@@@@@@@@@@@@@@',allDeniedSect)
	// if (allDeniedSect.every((el) => el)) {
	// 	delete accAuto?.cold?.afterD
	// 	delete accAuto?.cold?.timeAD
	// 	delete accAuto?.cold?.defrostAllFinish
	// 	delete accAuto?.cold?.drainAll
	// 	delete accAuto?.cold?.defrostAll
	// }
}

module.exports = { cold: deniedCold, combi: deniedCombi, off: offDenied }

/**
 *
 * @param {*} mS механизмы секции
 * @returns {string[][]} ИД испарителей объединенные в пары по одинаковому ВНО
 */
function coupleClr(mS) {
	const hashClr = mS.coolerS.reduce((rlt, el) => {
		rlt[el._id] = el
		return rlt
	}, {})
	// Разбиваем испарители секции на пары по признаку одинаковых ВНО
	const couple = mS.allFanClr.reduce((rlt, el, i) => {
		// el - ВНО какого-то испарителя
		const uid = el.module.id + '' + el.module.channel
		// Испарители с одинаковыми ВНО
		const pairC = []
		// Берем испаритель и его ВНО (hashClr[idClr].fan) проверяем на схожесть с el по uid
		for (const idClr in hashClr) {
			const f = hashClr[idClr].fan.find((ff) => ff.module.id + '' + ff.module.channel === uid)
			if (f) {
				pairC.push(idClr)
				delete hashClr[idClr]
			}
		}
		rlt.push(pairC)
		return rlt
	}, [])
	return couple
}
