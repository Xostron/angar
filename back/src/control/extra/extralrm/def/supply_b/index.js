const { msgB, msgBB, msg } = require('@tool/message')
const { getSumSigBld, getSignalList } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { data: store } = require('@store')
const { getS } = require('@tool/get/building')

// Авария питания: сигнал склада, секции и батарея (генерация сообщений "Авария питания (сигнал), авария питания (батарея)")
function supplyB(bld, sect, obj, s, se, m, automode, acc, data) {
	acc.o ??= {}
	const reason = getReason(bld, obj)
	// console.log(1, 'reason', reason)
	// Если взведена Авария питания (Ручной сброс) - игнорируем данную аварию
	if (isExtralrm(bld._id, null, 'sb')) {
		reason.forEach((el) => delMessage(el, bld, acc))
		return
	}

	reason.forEach((el) => {
		// Сигнала нет - сброс сообщения
		if (!el.v) {
			delMessage(el, bld, acc)
			return
		}
		// Сигнал установлен - генерация сообщения
		// if (!acc.o?.[el.id]) {
		message(el, bld, obj?.data?.section ?? [])
		acc.o[el.id] = true
		// }
	})

	acc._alarm = Object.values(acc.o).some(Boolean)

	// console.log(4, acc._alarm, acc, Object.values(acc.o))
	return acc?._alarm ?? false
}

module.exports = supplyB

function message(el, bld, section) {
	switch (el.id) {
		case 'bld':
			wrExtralrm(bld._id, null, 'supply', { date: new Date(), ...msgB(bld, 38) })
			break
		case 'battery':
			wrExtralrm(bld._id, null, 'battery', msgBB(bld, 106))
			break
		default:
			// секции
			const sect = section.find((sect) => sect._id == el.id)
			wrExtralrm(bld._id, el.id, 'supply', {
				date: new Date(),
				...msg(bld, sect, 38),
			})
			break
	}
}

function delMessage(el, bld, acc) {
	switch (el.id) {
		case 'bld':
			delExtralrm(bld._id, null, 'supply')
			break
		case 'battery':
			delExtralrm(bld._id, null, 'battery')
			break
		default:
			delExtralrm(bld._id, el.id, 'supply')
			break
	}
	delete acc.o?.[el.id]
}

function getReason(bld, obj) {
	// Сигнал склада, сигналы секций, сигнал батареи
	const reason = [
		// Секции: Массив значений сигналов "Питания в норме" со всех секций
		...getSignalList(bld?._id, obj, 'supply').map((el) => ({
			id: el.owner.id,
			v: obj.value?.[el?._id] ?? null,
		})),
		{ id: 'battery', v: store.battery },
		{ id: 'bld', v: getSumSigBld(bld._id, obj, 'supply') },
	]
	return reason
}
