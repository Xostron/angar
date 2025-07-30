const fnAgg = require('./fn')

// Управляемый агрегат
function slaveAgg(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	// По агрегатам
	m.cold.slaveAgg.forEach((el) => {
		// Состояние агрегата и компресоров, значение beep компрессоров
		const stateAgg = obj.value[el._id]
		// Узнать Давление на всасе pin
		const cooler = obj.data.cooler.find((clr) => clr.aggregateListId == el._id)
		let pin = obj.data.sensor.find((sen) => sen.owner.id == cooler._id && sen.type == 'pin')
		pin = obj.value[pin._id]
		// Управление агрегатом
		fnAgg(el, stateAgg, pin, bld, obj, s, acc)
	})
}

module.exports = slaveAgg


