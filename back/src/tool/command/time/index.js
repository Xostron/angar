const { data: store } = require('@store')
/**
 * Преобразование hh:mm (string) в миллисекунды
 * @param {*} hm hh:mm (string), 01:42
 */
function ms(hm) {
	if (!hm || typeof hm !== 'string') return null
	return hm.split(':').reduce((acc, val, i) => {
		if (i === 0) acc = +val * 60 * 60 * 1000
		if (i === 1) acc += +val * 60 * 1000
		return acc
	}, 0)
}

// Задержка, мс
function delay(t = 0) {
	return new Promise((resolve, reject) => {
		if (t <= 0) return resolve(false)
		setTimeout(() => {
			resolve(true)
		}, t)
	})
}

// Преобразование в объект даты и времени {begin, end}
function range(o) {
	// string 23:00 => [часы, минуты]
	const d1 = o.begin.split(':')
	const d2 = o.end.split(':')
	// Время в мс
	let begin = new Date().setHours(+d1[0], +d1[1], 0, 0)
	let end = new Date().setHours(+d2[0], +d2[1], 0, 0)
	// Проверка диапазона, учет суток (начало 23:00 (сегодня), конец 02:00 (завтра))
	if (begin >= end) end = end + 24 * 3600 * 1000
	// объект дата и время
	begin = new Date(begin)
	end = new Date(end)
	return { begin, end }
}

/**
 * Проверка на пройденное время, true - время прошло
 * @param {String||DateTime} t дата и время (начальная точка)
 * @param {Integer} d пройденное время, мс
 * @returns {Boolean}
 */
function compareTime(t, d) {
	try {
		if (typeof t === 'string') t = new Date(t)
		const now = new Date()
		return now - t >= d
	} catch (error) {
		console.log('compareTime', error)
		return true
	}
}

/**
 * Читаемая разница между переданным временем и текущим в минутах и секундах
 * @param {String||DateTime} doc время
 * @returns {String}
 */
function runTime(doc) {
	try {
		if (typeof doc === 'string') doc = new Date(doc)
		const t = (new Date() - doc) / 1000
		let m = Math.trunc(t / 60)
		return `Продолжительность: ${m ? m + ' мин ' : ''}${(t % 60).toFixed(0) + ' сек'} `
	} catch (error) {
		console.log('runTime', error)
		return ''
	}
}

/**
 * @param {*} doc Старт
 * @param {*} sum моточасы
 * @returns моточасы+зафиксированные часы работы
 */
function engineTime(doc, sum) {
	try {
		if (typeof doc === 'string') doc = new Date(doc)
		// Фиксирование
		const t = (new Date() - doc) / 1000
		let h = +(t / 3600)
		return +(sum + h).toFixed(2)
	} catch (error) {
		return ''
	}
}

// Подсчет моточасов
function engineHour(el, state, ehour) {
	// Включение
	if (state === 'run' && !ehour[el._id]?.start) {
		store.engineHour[el._id] = { value: ehour[el._id]?.value ?? 0, start: new Date() }
	}
	// Выключение
	if (state !== 'run' && ehour[el._id]?.start) {
		store.engineHour[el._id] = { value: engineTime(ehour[el._id].start, ehour[el._id]?.value ?? 0) }
	}
}

/**
 * Получить истекшее время
 * @param {*} date Дата отсчета
 * @returns {string}'HH:mm'
 */
function elapsedTime(date) {
	if (!date) return null
	const cur = new Date()
	const d = new Date(date)
	// время в минутах
	const r = (cur - d) / 60000
	// console.log(9999, r, r / 60, Math.trunc(r / 60), Math.trunc(r % 60))

	// часы
	const hh = Math.trunc(r / 60) < 10 ? '0' + Math.trunc(r / 60) : Math.trunc(r / 60)

	// мин
	const mm = Math.trunc(r % 60) < 10 ? '0' + Math.trunc(r % 60) : Math.trunc(r % 60) >= 60 ? '00' : Math.trunc(r % 60)

	return `${hh}ч ${mm}м`
}

// Вычисляет сколько в минут работает в указанном режиме и выводит в консоль
function onTime(code, acc) {
	console.log(999,acc)
	if (!acc.state[code]) acc.state[code] = new Date();
	console.log('\t'+code, runTime(acc.state[code]));
}

module.exports = { ms, delay, range, compareTime, runTime, engineTime, engineHour, elapsedTime, onTime }
