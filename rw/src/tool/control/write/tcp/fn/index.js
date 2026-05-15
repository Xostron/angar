const { int } = require('@tool/control/read/fn')

function regist(opt) {
	// Стартовый адрес
	const i = opt.wr?.start
	// Регистры
	let v = opt.value.map((v) => v * (opt.wr?.on || 1))
	// Аналоговый вывод - модуль у которого имя окончивается на "AO" и Назначение use:'w' - запись
	if (!opt?.name?.endsWith('AO')) v = mBitTomInt(v)
	return { i, v }
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
