const { data: store } = require('@store')

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
			const a = [
				[!alrAuto, '!alrAuto'],
				[sectM === false, 'sectM'],
				[s?.smoking?.on, 's?.smoking?.on'],
				[s?.ozon?.on, 's?.ozon?.on'],
				[!s?.coolerCombi?.on, '!s?.coolerCombi?.on'],
			]

			console.log(
				'Проходим по парам испарителей и одиночкам',
				a.filter((e) => e[0]),
			)
			a.filter((e) => e[0] === true)?.length !== 0
				? fnChange(0, null, 0, 0, null, clr)
				: fnChange(0, 0, 0, 0, null, clr)
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
				const a = [
					[!alrAuto, '!alrAuto'],
					[sectM === false, 'sectM === false'],
					[s?.smoking?.on, 's?.smoking?.on'],
					[s?.ozon?.on, 's?.ozon?.on'],
					[!s?.coolerCombi?.on, '!s?.coolerCombi?.on'],
				]

				console.log(
					'Полное отключение пары',
					a.filter((e) => e[0]),
				)
				a.filter((e) => e[0] === true).length !== 0
					? fnChange(0, null, 0, 0, null, clr)
					: fnChange(0, 0, 0, 0, null, clr)
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
			console.log('Частичное отключение пары')
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

module.exports = offDenied


/**
 * Поиск парных испарителей
 * @param {*} mS Механизмы секции
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