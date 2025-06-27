const cold = require('../cold')
const normal = require('../normal')

// Полное описание секции
async function combi(result, idS, idB, obj) {
	await normal(result, idS, idB, obj)
	await cold(result, idS, idB, obj)
}

module.exports = combi
