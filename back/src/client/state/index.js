const transformStore = require('../../routes/api/tenta/read/store/transform')
const transformPC = require('@routes/api/tenta/read/pc/transform')
const { preparing, convertPC, convertSec } = require('./fn')
const { delay } = require('@tool/command/time')

async function state() {
	try {
		const o = await preparing()
		if (!o) return
		const { data, value, ref, hub } = o
		console.log(666, hub)
		// resPC - Карточки PC
		let resPC = transformPC(value, data.building)
		// resSec - Полное содержимое секции
		let resSec = {}
		for (const sec of data.section) resSec[sec._id] = await transformStore(sec.buildingId, sec._id)
		// Преобразуем ключи объекта
		resSec = { ...convertPC(resPC), ...convertSec(resSec) }
		// console.log(663, 'resSec', JSON.stringify(resSec, null, ' '))
		// Данные переданы
		return true
	} catch (error) {
		console.error(666666, error)
	}
}

async function loopState() {
	while (true) {
		state()
			.then((ok) =>
				ok
					? console.log('\x1b[33m%s\x1b[0m', 'Режим опроса: Poll - данные POS переданы на сервер ')
					: console.log('\x1b[33m%s\x1b[0m', 'Режим опроса: Poll отключен')
			)
			.catch((err) => {
				// TODO Фиксировать не переданный state
			})
		// отправка состояния каждые 5 минут
		await delay(process.env?.PERIOD_STATE ?? 10000)
	}
}

module.exports = loopState
