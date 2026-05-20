const { data: store } = require('@store')

// Отключение запрещенных к работе испарителей с проверкой на дублирование ВНО
function offDenied(idB, mS, couple, s, fnChange, accAuto, alrAuto, sectM, obj) {
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
				[!alrAuto, 'В режиме обычного склада (нет аварий авторежима)'],
				[sectM === false, 'Секция в ручном режиме'],
				[s?.smoking?.on, 'Включено окуривание'],
				[s?.ozon?.on, 'Включен озонатор'],
				[!s?.coolerCombi?.on, 'Выключен испарител. (настройки)'],
			]
			// Пара испарителей выведена из работы
			const off = isOffPair(pair, mS, obj.value)
			console.log(
				'\toffDenied: один испаритель',
				a.filter((e) => e[0]),
			)
			a.filter((e) => e[0] === true)?.length !== 0 && !off
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
			// 1. В режиме обычного склада (нет аварий авторежима)
			// 2. Секция в ручном режиме
			// 3. Включено окуривание
			// 4. Включен озонатор
			// 5. Выключено оборудование испарителя
			pair.forEach((idClr) => {
				const clr = mS.coolerS.find((el) => el._id === idClr)
				const a = [
					[!alrAuto, 'В режиме обычного склада (нет аварий авторежима)'],
					[sectM === false, 'Секция в ручном режиме'],
					[s?.smoking?.on, 'Включено окуривание'],
					[s?.ozon?.on, 'Включен озонатор'],
					[!s?.coolerCombi?.on, 'Выключен испарител. (настройки)'],
				]
				console.log(
					'\toffDenied: Полное отключение пары, из-за этих причин ВНО не заблокирован',
					a.filter((e) => e[0]),
				)
				// Пара испарителей выведена из работы
				const off = isOffPair(pair, mS, obj.value)
				console.log('\tПара испарителей выведена из работы', off)
				a.filter((e) => e[0] === true).length !== 0 && !off
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
}

module.exports = offDenied

// Блокировка ВНО испарителей, если вся пара выведена из работы
function isOffPair(pair, mS, value) {
	const r = pair.filter((idClr) => {
		const fan = mS.coolerS.find((el) => el._id === idClr)?.fan?.[0]
		return value[fan._id].state != 'alarm' && value[fan._id].state !== 'off'
	})
	return !r.length
}
