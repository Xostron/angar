const { v4: uuidv4 } = require('uuid')

module.exports = data = {
	drying: 'Сушка запрещена',
	cure: 'Лечение запрещено',
	cooling: 'Охлаждение запрещено',
	heat: 'Нагревание запрещено',
	vent: 'Внутренняя вентиляция запрещена',
	accel: 'Разгонные вентиляторы запрещены',
	ozon: 'Озонатор запрещен',
	heater: 'Обогреватель запрещен',
	co2: 'Удаление СО2 запрещено',
	wetting: 'Увлажнитель запрещен',

	get(bld, name, key) {
		return {
			date: new Date().toLocaleString('ru'),
			type: key,
			buildingId: bld._id,
			typeSignal: 'timer',
			msg: this?.[key] ?? `Таймер: ${name}, ${key}`,
			uid: uuidv4(),
			title: '',
		}
	},
}
