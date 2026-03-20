const { writeSync } = require('@tool/json')
const { data: store, retainDir } = require('@store')
const transform = require('./transform')

function writeRetain(obj) {
	// Собираем здесь данные на запись в аккумуляторе store.retain
	transform(obj)
	// Записываем файл retain
	const filename = 'data'
	writeSync({ [filename]: store.retain }, retainDir, null)
}

module.exports = writeRetain
