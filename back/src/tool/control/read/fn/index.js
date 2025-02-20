// максимальное значение для int16
const max = 65535

// Чтение регистров
function rhr(client, opt, name, options = {}) {
	return new Promise((resolve, reject) => {
		const n = count(opt, options)
		client
			.readHoldingRegisters(opt.start, n)
			.then((r) => {
				// if (options.name=='МВ110-8АC')console.log(999, r.response._body[name])
				let v = r.response._body[name]
				v = data(v, opt, options)
				resolve(v)
			})
			.catch(reject)
	})
}

// Преобразование данных модуля
function count(opt, options) {
	switch (opt.type) {
		case 'float':
			return (opt.channel - 1) * opt.step + 2
		case 'boolean':
			return Math.trunc(opt.channel / 16) + (opt.channel % 16 ? 1 : 0)
		case 'int':
		case 'int10':
			return countMB101(opt, options)
	}
	return 1
}

// Преобразование данных модуля
function data(arr, opt, options) {
	let a
	switch (opt.type) {
		case 'float':
			a = dataFloat(arr, opt)
			return a
		case 'boolean':
			a = bit(arr, opt?.noreverse)
			return a
		case 'int10':
			a = dataMB101(arr, opt, options, max)
			return a
	}
	return arr
}

// Преобразование данных модуля типа float
function dataFloat(arr, opt) {
	const a = []
	for (let i = 0; i < opt.channel; i++) {
		let v = arr.splice(0, opt.step)
		v = v.splice(0, 2)
		v = float(v)
		a.push(v)
	}
	return a
}

// Вернуть битовую маску
function bit(arr, noreverse) {
	arr = arr.map((v) => v.toString(2).split('').reverse().join('').padEnd(16, 0))
	if (!noreverse) arr.reverse()
	return Array.from(arr.join(''), (v) => +v)
}

// Вернуть дробное число из двух чисел
function float(arr) {
	const a = arr[0].toString(16)
	const b = arr[1].toString(16)
	const str = b + a
	const int = parseInt(str, 16)
	if (!int) return 0
	const sign = int >>> 31 ? -1 : 1
	let exp = ((int >>> 23) & 0xff) - 127
	let mantissa = ((int & 0x7fffff) + 0x800000).toString(2)
	let float32 = 0
	for (i = 0; i < mantissa.length; i++) {
		float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0
		exp--
	}
	return float32 * sign
}

function ArrintToBin(arr) {
	const a = arr[0].toString(16)
	const b = arr[1].toString(16)
	return HexTobin(b + a)
}

function HexToDec(hex) {
	return parseInt(hex, 16)
}

function HexTobin(hex) {
	return '00000000' + parseInt(hex, 16).toString(2)
}

// Массив boolean => целое число Integer
function int(arr) {
	const a = arr.join('')
	return parseInt(a, 2)
}

// Только для модуля МВ210-101 Int/10 - кол-во регистров на чтение
function countMB101(opt, options) {
	const { name, interface, use } = options
	// Другие модули
	if (name !== 'МВ210-101 Int/10' || interface != 'tcp' || use != 'r' || opt.channel !== 8) {
		return opt.channel*opt.step
	}
	// Модуль МВ210-101 Int/10
	return opt.channel * 2
}

// Чтение и анализ только для модуля 'МВ210-101 Int/10'
function dataMB101(arr, opt, options, max) {
	const { name, interface, use } = options
	// Для вычисления отрицательных чисел
	const limit = max / 2
	// Обычный модуль int10
	if (name !== 'МВ210-101 Int/10' || interface != 'tcp' || use != 'r' || opt.channel !== 8) return arr.map((v) => fnLimit(v, limit, max))
	// Модуль МВ210-101 Int/10
	const status = arr.splice(opt.channel, opt.channel)
	return arr.map((v, i) => (status[i] == 0 ? fnLimit(v, limit, max) : fnLimit(v, limit, max, false)))
}

function fnLimit(v, limit, max, ok = true) {
	return ok ? (v > limit ? v - max : v) / 10 : null
}

module.exports = {
	data,
	count,
	rhr,
	int,
}
