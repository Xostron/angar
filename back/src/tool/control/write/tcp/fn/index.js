const { int } = require('@tool/control/read/fn')

function regist(opt) {
	// Для TCP Модуля DO opt.wr.type==boolean
	// Стартовый адрес
	const i = opt.wr.start
	// Регистры
	// const v = opt.value.map((v) => v * (opt.wr.on ?? 1)).reverse()
	const v = opt.value.map((v) => v * (opt.wr.on ?? 1))
	const vv = mBitTomInt(v)
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
