const { getYesterday } = require('@root/control/extra/extra/def/report_day_drying/fn')
const { data: store, readAcc } = require('@store/index')
const { v4: uuidv4 } = require('uuid')

function rdDrying(idB, section, obj) {
	// Аккумулятор суточной сушки
	const acc = readAcc(idB, 'building', 'rdDrying')
	// Текщий час
	const curHH = new Date().getHours()
	// Вчерашний день
	const yesterday = getYesterday(new Date().getDate()) + ''
	// Настройки сушки: задание сущки в часах
	const daily = store.calcSetting?.[idB]?.drying?.daily

	// *******Разрешение на отправку ПУШ:*******
	// Отчет за вчерашний день отсутствует
	if (!acc?.total?.[yesterday]) return null
	// Текущий час не равен 8 утра
	if (curHH !== 8) return null
	// Нет суточного задания сушки (настройки)
	if (!daily) return null
	// Не в режиме сушки
	if (obj.retain?.[idB]?.automode != 'drying') return null

	// *******Разрешено*******
	// Инициализация задания сушки
	acc.daily ??= daily
	// Сущка за вчера, ч
	const t = +(acc.total?.[yesterday] / 1000 / 3600).toFixed(2)
	// Кол-во часов перенесенных на сегодня
	const add = daily - t < 0 ? 0 : +(daily - t).toFixed(2)

	// ******* Если Кол-во часов перенесенных на сегодня < 0.1ч(6 мин), то не отправляем пуш*******
	if (add < 0.1) return null

	// План сушки на сегодня
	acc.daily = +(acc.daily + add).toFixed(2)
	// Предел задания сушки <=24 ч
	acc.daily = acc.daily > 24 ? 24 : acc.daily

	let msg = `Сушка за вчера: ${t}ч из ${daily}ч.`
	if (add) msg += ` Перенос на сегодня - ${add}ч.`
	msg += ` План на текущие сутки: ${acc.daily}ч`

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
