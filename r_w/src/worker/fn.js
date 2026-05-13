const arrData = require('./data')

// partition(arrData, 4)

/**
 * Распределение модулей по потокам
 * @param {*} arr массив модулей на чтение
 * @param {*} num Кол-во потоков
 * @returns {object[][]} Возвращаем подмассивы с модулями, 
 * для каждого потока свой набор модулей
 */
function partition(arr, num) {
	// Массив массивов
	const dataThread = new Array(num).fill()
	let i = 0
	// По модулям
	while (i < arr.length) {
		// По потокам
		dataThread.forEach((_, j) => {
			// Создание подмассива
			if (!(dataThread[j] instanceof Array)) dataThread[j] = []
			// Добавляем модуль в подмассив
			arr[i] ? dataThread[j].push(arr[i]) : null
			// следующий модуль
			i++
		})
	}
	// Возвращаем результат массив с подмассивами, кол-во подмассивов равно кол-ву потоков
	// console.log(55, dataThread, arr.length)
	return dataThread
}

function delay(time = 0) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, time, !time ? false : true)
	})
}

module.exports = {partition, delay}
