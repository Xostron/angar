const def = require('./def')
const checkSupply = require('./supply')
const { change, checkDefrost } = require('./fn')
const { setACmd, data: store, isExtralrm } = require('@store')

function main(bld, obj, bdata, alr) {
	const { data, retain } = obj
	const { start, s, se, m, accAuto, supply } = bdata
	const fnChange = (sl, f, h, add, code) => change(bdata, bld._id, sl, f, h, add, code)
	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		console.log(`\nСклад: ${bld?.name} Секция: ${sect?.name} [${sect?.buildingId}, ${sect?._id}] `)
		const stateCooler = obj.value?.[m?.cold?.cooler?.[0]?._id]
		const supplySt = checkSupply(supply, bld._id, retain)
		const aggr = isRunAgg(obj.value, bld._id)
		console.log('\tРежим:', stateCooler?.state, stateCooler?.name)

		// Работа склада запрещена
		store.denied[bld._id] = !start || alr || !aggr || !supplySt
		if (store.denied[bld._id]) {
			console.log('\tОстановка из-за ошибок:')
			console.log('\t\tСклад остановлен:', !start)
			console.log('\t\tАвария:', alr)
			console.log('\t\tАгрегат готов к работ', !aggr)
			console.log('\t\tОжидание после включения питания', !supplySt)

			delete accAuto?.state?.off
			delete accAuto.target
			delete accAuto.targetDT

			// Пропуск: Испаритель выключен или окуривание запущено
			if (stateCooler?.state === 'off-off-off' || store.smoking[bld._id]?.work) continue
			// Выключение всех узлов испарителя
			fnChange(0, 0, 0, 0)
			delete accAuto?.state?.off
			continue
		}
		// Вычисление Т target
		if (
			!accAuto.targetDT ||
			accAuto.targetDT.getDate() !== new Date().getDate() ||
			accAuto?.isChange(s.cold.decrease, s.cold.target)
		) {
			// Замыкание на изменение настроек
			accAuto.isChange = isChange(s.cold.decrease, s.cold.target)

			// Температура задания на сутки (decrease мб равен 0) по минимальной тмп. продукта
			const t = se.cooler.tprd - s.cold.decrease
			accAuto.target = +(t <= s.cold.target || s.cold.decrease === 0 ? s.cold.target : t).toFixed(1)

			// Время создания задания
			accAuto.targetDT = new Date()
			accAuto.state ??= {}
		}

		console.log(
			'\tТмп. задания на сутки',
			se.cooler.tprd,
			'-',
			s.cold.decrease,
			'=',
			accAuto.target,
			'от',
			accAuto.targetDT.toLocaleString()
		)

		if (!checkDefrost(fnChange, accAuto, se, s, stateCooler.state, stateCooler))
			def?.[stateCooler.state](fnChange, accAuto, se, s, bld)
	}
}

function isRunAgg(value, idB) {
	return value.total[idB].aggregate.state !== 'alarm' ? true : false
}

module.exports = main

function isChange(...hold) {
	return (...cur) => {
		const holding = hold.join(' ')
		const current = cur.join(' ')
		return holding !== current
	}
}
