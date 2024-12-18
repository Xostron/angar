const { int } = require('@tool/control/read/fn')

function regist(opt) {
	// Для TCP Модуля DO opt.wr.type==boolean
	// Стартовый адрес
	const i = opt.wr.start
	// Регистры
	const v = opt.value.map((v) => v * (opt.wr.on ?? 1)).reverse()
	return { i, v: [int(v)] }
}
module.exports = {regist}