const { data: store } = require('@store')

// Открытие клапана по заданию в %
function tracking(out, retain) {
	const cmdT = store.commandT
	const cmd = store.command
	// Команды управления - модифицируем выхода out
	if (cmdT)
		// по складам
		for (const build in cmdT) {
			// по модулям склада
			for (const mdl in cmdT[build]) {
				// по каналу модуля
				for (const channel in cmdT[build][mdl]) {
					const idV = cmdT[build][mdl][channel]._id
					// Задание на открытие/закрытие, сек = Текущая позиция клапана,сек - Задание, сек
					const sp = Math.abs(retain[build].valvePosition[idV] - +cmdT[build][mdl][channel].time)
					// Выход
					out[mdl][+channel] = cmdT[build][mdl][channel].value
					// Фиксируем время отключения клапана
					if (!cmdT[build][mdl][channel].endTime) {
						cmdT[build][mdl][channel].endTime = +new Date().getTime() + sp
					}
					// Проверка времени отключения, удаление текущей команды из стека при истечении времени
					if (
						!!cmdT[build][mdl][channel].endTime &&
						+new Date().getTime() >= cmdT[build][mdl][channel].endTime
					) {
						out[mdl][+channel] = 0
						delete cmdT[build][mdl][channel]
					}
					// Команда Стоп
					if (cmd?.[build]?.[mdl]?.[channel] === 0) {
						out[mdl][+channel] = 0
						delete cmdT[build][mdl][channel]
					}
				}
			}
		}
}

module.exports = tracking
