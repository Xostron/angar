const def = {
	read: {
		rtu: require('../read/rtu'),
		tcp: require('../read/tcp'),
	},
	write: {
		rtu: require('../write/rtu'),
		tcp: require('../write/tcp'),
	},
}

async function make(elem, type = 'read') {
	const t = type === 'read' ? 'чтение' : 'запись'
	let v
	try {
		// Чтение|запись данных модуля
		v = await fnMake(elem, type)
	} catch (error) {
		if (error.name === 'AbortError')
			console.log(`Ошибка ${t} модуля: Запрос отменен по таймауту`, error.message, elem.ip)
		else {
			console.log(`Ошибка ${t} модуля`, error, elem.ip)
		}
	}
	return v
}

/**
 * Чтение/запись модуля с прерыванием по таймеру 5сек
 * Если модуль читается больше 2 сек, то прерываем его чтение
 * @param {object} o Данные о модуле
 * @returns {Promise<[][]>} Массив значений [[...input], [...output]] модуля
 */
function fnMake(o, type = 'read') {
	// Автоматическая отмена чтения модули через 5сек
	const t = (o?.timeout ?? 10) * 1000
	// if (o.ip === '192.168.21.132') console.log('======timeout===========', t)
	const signal = AbortSignal.timeout(t)

	// 1. Проверяем, не отменён ли сигнал сразу
	if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

	return new Promise((resolve, reject) => {
		// Обработчик события по AbortSignal.timeout(2000)
		const onAbort = () => reject(new DOMException('Operation was aborted', 'AbortError'))

		// 2. Подписываемся на AbortSignal.timeout
		if (signal) signal.addEventListener('abort', onAbort, { once: true })
		// 3. Не указан интерфейс модуля
		if (!def[type]?.[o.interface]) {
			clearSignal(signal, onAbort)
			resolve({ error: 'Не указан интерфейс модуля', info: opt })
		}
		// 4. Чтение/запись модуля
		def[type]?.[o.interface](o.ip, o.port, o)
			.then((r) => {
				clearSignal(signal, onAbort)
				resolve(r)
			})
			.catch((err) => {
				clearSignal(signal, onAbort)
				console.log(err)
			})
	})
}
// Удаления подписки на событие AbortSignal.timeout
function clearSignal(signal, onAbort) {
	signal.removeEventListener('abort', onAbort)
}

module.exports = make
