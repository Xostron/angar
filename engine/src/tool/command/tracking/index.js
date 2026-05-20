const { data: store } = require('@store')
const { getMdl } = require('@tool/get/module')

/**
 * Открытие клапана по заданию в %
 * @param {object} out Маска (слияние маски и команд управления)
 * @param {object[]} mdls массив модулей без дубляжей
 * @param {object} retain Сохраненные настройки склада
 * @returns
 */
function tracking(out, mdls, retain) {
	const cmdT = store.commandT
	const cmd = store.command

	if (!cmdT) return
	// Команды управления - модифицируем выхода out
	// по складам
	for (const idB in cmdT) {
		// по модулям склада
		for (const idM in cmdT[idB]) {
			// по каналу модуля
			for (const channel in cmdT[idB][idM]) {
				// Рама соответсвующего модуля
				const { id } = getMdl(mdls, idM)
				// ИД клапана
				const idV = cmdT[idB][idM][channel]._id
				// Задание на открытие/закрытие, сек = Текущая позиция клапана,сек - Задание, сек
				const sp = Math.abs(retain[idB].valvePosition[idV] - +cmdT[idB][idM][channel].time)
				// Выход
				out[id][+channel] = cmdT[idB][idM][channel].value
				// Фиксируем время отключения клапана
				if (!cmdT[idB][idM][channel].endTime) {
					cmdT[idB][idM][channel].endTime = +new Date().getTime() + sp
				}
				// Проверка времени отключения, удаление текущей команды из стека при истечении времени
				if (
					!!cmdT[idB][idM][channel].endTime &&
					+new Date().getTime() >= cmdT[idB][idM][channel].endTime
				) {
					out[id][+channel] = 0
					delete cmdT[idB][idM][channel]
				}
				// Команда Стоп
				if (cmd?.[idB]?.[idM]?.[channel] === 0) {
					out[id][+channel] = 0
					delete cmdT[idB][idM][channel]
				}
			}
		}
	}
}

module.exports = tracking
