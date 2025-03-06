const extralrm = require('@control/extra/extralrm')
const { extra } = require('@control/extra/extra')
const tuneup = require('@tool/service/tune')
const { data: store, rs, isAlr, readAcc } = require('@store')
const def = require('@control/main/def/normal/def')

function build(start, building, obj, s, se, m, am, accAuto) {
	let alrBld = false,
		alrAm = false
	// Build Always - всегда выполняются
	alrBld = alrBld || extralrm(building, null, obj, s, se, m, am, null, 'building', 'always')
	extra(building, null, obj, s, se, m, null, null, null, 'building', 'always')

	// Склад включен
	if (start) {
		// Дополнительные аварии склада
		alrBld = alrBld || extralrm(building, null, obj, s, se, m, am, null, 'building', 'on')
		// Дополнительные функции склада (Склад включен)
		extra(building, null, obj, s, se, m, null, null, null, 'building', 'on')
		// Аварии авторежима
		rs(building._id, am, def[am].alarm(s, se, building, accAuto))
		alrAm = isAlr(building._id, am)
	} else {
		// Дополнительные функции склада (Склад выключен)
		extra(building, null, obj, s, se, m, null, null, null, 'building', 'off')
	}

	// Калибровка клапанов
	tuneup(obj)
	return { alrBld, alrAm }
}

module.exports = build

// Аварии возникающие в секции, но останавливающие работу всего склада
function sumExtralrmSection(building, section) {
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
	console.log(101010101, '=====', alrS, building.name, alrSect)
	return alrS
}
