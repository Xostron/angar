const msg = require('@dict/message');
// console.log(msg);

function push(bldId, data) {
	// Необходимы список аварий
	const need = Object.values(msg)
		.filter((el) => el.flt && el.flt[0] === true)
		.map((el) => el.msg);
	// console.log('\n\n1111\n', JSON.stringify(need));

	const list = [];
	const connect = data.alarm?.banner?.connect?.[bldId];
	if (connect) list.push(connect);
	data.alarm.signal?.[bldId]?.forEach((el) => {
		if (need.includes(el.msg)) list.push(el);
	});
	// console.log('list', JSON.stringify(list));
	return list;
}

module.exports = push;
