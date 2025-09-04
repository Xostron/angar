const soft = require('./soft')
const { sensor } = require('@tool/command/sensor')

function softStart(idB, idsS, fan, obj, s, start = false) {
	idsS.forEach((idS) => {
		// Тип управления: с ПЧ или Реле
		const type = fan[idS].type
		// Датчики секции
		const se = sensor(idB, idS, obj)
		soft[type](idB, idS, fan[idS], obj, s, se, start)
	})
}

module.exports = softStart
