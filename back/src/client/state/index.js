const state = require('@tool/state/client')
const { delay } = require('@tool/command/time')

/**
 * Получение данных от ЦС: Сервер ангара каждые 10 сек
 * отправляет полное состояние своих складов на Админ сервер (Tenta)
 * @returns
 */
module.exports = async function loopState() {
	while (true) {
		try {
			await state()
			// отправка состояния каждые 10 секунд
			await delay(process.env?.PERIOD_STATE ?? 10000)
		} catch (error) {
			console.log(660001, error.message)
			return
		}
	}
}
