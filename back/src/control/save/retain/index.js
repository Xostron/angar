const { writeSync } = require('@tool/json')
const { data: store, retainDir } = require('@store')
const transform = require('./transform')

function writeRetain(obj) {
	// Собираем здесь данные на запись в аккумуляторе store.retain
	transform(obj)
	// Записываем файл retain
	const filename = 'data'
	if (!store?.retain) return console.log(9999999)
	writeSync({ [filename]: store.retain }, retainDir)
}

module.exports = writeRetain
