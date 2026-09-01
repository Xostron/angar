const { int } = require('@tool/control/read/fn')

// Подготовка данных на запись {Стартовый адрес, значение выходов}
function regist(opt) {
	// Стартовый адрес
	const i = opt.wr?.start

	// Частотник oni-150 - дискретное управление
	if (opt?.name == 'FC oni-150 DO' || opt?.name == 'FC VFD1 DO') {
		// console.log('Истина2', opt.value)
		return { i, v: opt.value[0] === 0 ? [5] : [1] }
	}

	// Значение для включенного состояния
	let v = opt.value.map((v) => v * (opt.wr?.on || 1))

	// Аналоговый вывод - модуль у которого имя окончивается на "AO" и
	// Назначение use:'w' - запись
	if (opt?.name?.endsWith('AO')) return { i, v }

	// rtu модуль дискретных выходов, подключенный через конвертер
	if (opt?.slave) return { i, v }

	// Все остальные модули выхода
	v = mBitTomInt(v)
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
