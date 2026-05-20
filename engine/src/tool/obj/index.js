/**
 * Найти объект в массиве
 * @param {*} arr 
 * @param {*} q 
 * @returns 
 */
function aFind(arr, q) {
	return arr.find((o) => o._id === q)
}

module.exports = { aFind }
