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
		if(typeof t === 'string') t = new Date(t)
		console.log()
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
function runTime(doc){
	try {
		if(typeof doc === 'string') doc = new Date(doc)
		const t = (new Date() - doc) / 1000;
		let m = Math.trunc(t / 60);
		return `Продолжительность: ${m ? m + ' мин ' : ''}${
				(t % 60).toFixed(0) + ' сек'
			} `
	} catch (error) {
		console.log('runTime', error)
	 return ''	
	}
}

module.exports = { ms, delay, range, compareTime, runTime }
