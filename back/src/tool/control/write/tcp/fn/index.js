const { int } = require('@tool/control/read/fn')

function regist(opt) {
	let vv
	// Для TCP Модуля DO opt.wr.type==boolean
	// Стартовый адрес
	const i = opt.wr.start
	// Регистры
	// if (opt?.name?.endsWith('AO')){console.log(555, opt.value)}
	// const v = opt.value.map((v) => v * (opt.wr.on ?? 1)).reverse()
	const v = opt.value.map((v) => v * (opt.wr.on ?? 1))

	// TODO, добавить в админке тип type:"ao" Аналоговый модуль
	// Аналоговый вывод - модуль у которого имя окончивается на "AO" и Назначение use:'w' - запись
	if (opt?.name?.endsWith('AO')) {
		vv = v
		// console.log(666, opt.value, vv)
	} else {
		// Остальные модули
		vv = mBitTomInt(v)
	}
	// if (opt._id === '6800b92e56c6a01c90ecbc67') console.log(888, opt, i, v, vv)
	return { i, v: vv }
}

// Преобразование битовой маски --> массив Int16
function mBitTomInt(v) {
	const vv = []
	const size = 16
	for (let i = 0; i < Math.ceil(v.length / size); i++) {
		vv.push(v.slice(size * i, size * (i + 1)).reverse())
		vv[i] = int(vv[i])
	}
	return vv
}

module.exports = { regist }
