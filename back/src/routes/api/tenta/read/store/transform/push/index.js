const msg = require('@dict/message')
const { isExtralrm } = require('@tool/message/extralrm')
// console.log(msg);

function push(bldId, data) {
	// Необходимы список аварий
	const need = Object.values(msg)
		.filter((el) => el.flt && el.flt[0] === true)
		.map((el) => el.msg)
	// console.log('\n\n1111\n', JSON.stringify(need));

	const list = []

	// Если есть "авария питания (ручной сброс)",
	// то блокируем все пуши, кроме battery
	const battery = data.alarm?.banner?.battery?.[bldId]
	if (battery) {
		list.push(battery)
		console.log(5500,'list', JSON.stringify(list));
		return list
	}

	const connect = data.alarm?.banner?.connect?.[bldId]
	if (connect) list.push(connect)

	data.alarm.signal?.[bldId]?.forEach((el) => {
		if (need.includes(el.msg)) list.push(el)
	})
	console.log(5500,'list', JSON.stringify(list));
	return list
}

module.exports = push
