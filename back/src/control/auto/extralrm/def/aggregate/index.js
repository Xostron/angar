const { beepA } = require('@tool/beep')

// Аварийные сигналы beep компрессоров агрегата
function aggregate(building, section, obj, s, se, m, automode, acc, data) {
	// console.log(m.cold.aggregate)
	m.cold.aggregate.forEach((doc) => {
		doc.compressorList.forEach((cl) => {
			beepA(doc, cl, cl.beep, obj, building, acc, 66)
		})
	})
}



module.exports = aggregate
