const { data: store } = require('@store')
// Аварии возникающие в секции, но останавливающие работу всего склада
function sumExtralrmSection(building, obj) {
	const { data } = obj
	const section = data.section.filter((el) => el.buildingId == building._id)
	let alrS = false
	//Список аварий: Аварийное закрытие клапанов
	const list = ['alrClosed']
	// id секций склада
	const secIds = section.map((el) => el._id)
	// аварии склада
	const alrSect = store.alarm?.extralrm?.[building._id]
	// Поиск аварий из списка
	// По секциям
	for (const sId in alrSect) {
		if (!secIds.includes(sId)) continue
		// по авариям в секции
		for (const alrId in store.alarm?.extralrm?.[building._id]?.[sId]) {
			// авария не найдена
			if (!list.includes(alrId)) continue
			// авария найдена, тут же выходим
			alrS = true
			break
		}
		if (alrS) break
	}
	// console.log(101010101, '=====', alrS, building.name, alrSect)
	return alrS
}

module.exports = sumExtralrmSection
