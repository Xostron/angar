const { controlB } = require('./fn')
const { ctrlB } = require('@tool/command/fan')
const { data: store, setToOffBuild } = require('@store')

// Подготовка: Выключение склада влияет только на автоматические режимы секций, разгонного вентилятора и обогревателей
function toOffBuild(obj) {
	const { data, value, retain } = obj
	// Склад
	for (const el of data.building) {
		// Тип склада холодильник пропускается
		if (el?.type === 'cold') continue
		// Склад вкл/выкл
		const start = retain?.[el._id]?.start
		// Подготовка к выкл. склада уже выполнена
		const isDone = store.toOffBuild?.[el._id]
		// Склад включен - отмена подготовки к выкл
		if (start) {
			setToOffBuild({ _build: el._id, type: 'del' })
			continue
		}
		// Выключение склада уже выполнено - выходим
		if (isDone) continue

		// Подготовка к выкл склада (для секции в авторежиме)
		// Секции склада в авто
		let section = data.section.filter((s) => s?.buildingId === el?._id)
		section = section.filter((s) => retain?.[el._id]?.mode?.[s._id])
		// Разгонный вентилятор склада в авто
		let fan = []
		if (['time', 'temp'].includes(retain?.[el._id]?.accel?.mode)) {
			fan = data.fan.filter((f) => f.type === 'accel')
		}
		// Для проверки: кол-во узлов которые требуется выключить
		let count = section.length + fan.length
		console.log('Подготовка к выкл склада', el.code, count)
		// Выключение секций, работающие в авто
		for (const s of section) {
			const status = controlB(el._id, s?._id, data, value, 'launch')
			if (status) --count
		}
		// Выключение разгонных вентиляторов, если они в авто режиме
		for (const f of fan) {
			ctrlB(f, el._id, 'off')
			--count
		}
		// Все узлы выключены - установили флаг что склад выключен
		if (count <= 0) {
			setToOffBuild({ _build: el._id, value: true })
		}
	}
}

module.exports = toOffBuild
