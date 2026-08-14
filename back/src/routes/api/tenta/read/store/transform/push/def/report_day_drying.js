const { getYesterday } = require('@root/control/extra/extra/def/report_day_drying/fn')
const { data: store, readAcc } = require('@store/index')
const { v4: uuidv4 } = require('uuid')

function rdDrying(idB, section, obj) {
	// Аккумулятор суточной сушки
	const acc = readAcc(idB, 'building', 'rdDrying')
	const curHH = new Date().getHours()
	const yesterday = getYesterday(new Date().getDate()) + ''
	const daily = store.calcSetting?.[idB]?.drying?.daily
	
	// Разрешение на отправку ПУШ:
	// Отчет за вчерашний день отсутствует
	if (!acc?.total?.[yesterday]) return null
	// Текущий час не равен 8 утра
	if (curHH !== 8) return null
	// Нет суточного задания сушки
	if (!daily) return null

	// Разрешено
	// Сущка за вчера, ч
	const t = +(acc.total?.[yesterday] / 1000 / 3600).toFixed(2)
	// Перенос на сегодня
	const add = daily - t

	let msg = `Сушка за вчера: ${t}ч из ${daily}ч.`
	if (add) msg += ` Перенос на сегодня - ${add}ч.`
	msg += ` План на текущие сутки: ${(daily + add).toFixed(2)}ч`

	delete acc?.total?.[yesterday]

	return {
		buildingId: idB,
		code: 'drying',
		uid: uuidv4(),
		date: new Date().toLocaleString(),
		msg,
	}
}

module.exports = rdDrying
