module.exports = data = {
	drying: 'Сушка запрещена',
	cure: 'Лечение запрещено',
	cooling: 'Охлаждение запрещено',
	heat: 'Нагревание запрещено',
	vent: 'Вентиляция запрещена',
	accel: 'Разгонные вентиляторы запрещены',
	ozon: 'Озонатор запрещен',
	heater: 'Обогреватель запрещен',
	co2: 'Вентиляция по СО2 запрещена',
	wetting: 'Увлажнитель блокировать',

	get(name, key) {
		return {
			date: new Date()+'',
			type: key,
			typeSignal: 'timer',
			msg: this?.[key] ?? `Таймер: ${name}, ${key}`,
		}
	},
}
