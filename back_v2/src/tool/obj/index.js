// Найти объект в массиве
function aFind(arr, q) {
	return arr.find((o) => o._id === q)
}
module.exports = { aFind }
