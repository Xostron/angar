const fnAgg = require('./fn')

// Управляемый агрегат
function slaveAgg(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	// По aggregateList
	m.cold.slaveAgg.forEach((aggL) => {
		// Состояние агрегата (компресор, beep и сам агрегат)
		const stateAgg = obj.value[aggL._id]
		// Давление на всасе pin
		const cooler = obj.data.cooler.find((clr) => clr.aggregateListId == aggL._id)
		let pin = obj.data.sensor.find((sen) => sen.owner.id == cooler._id && sen.type == 'pin')
		pin = obj.value[pin._id]
		// Обработка управляемого агрегата
		fnAgg(aggL, stateAgg, pin, bld, obj, s, acc)
	})
}

module.exports = slaveAgg


