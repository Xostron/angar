const force = require('./force')
const toAuto = require('./mode/to_auto')
const toMan = require('./mode/to_man')
const toOff = require('./mode/to_off')
const toOffBuild = require('./mode/to_off_build')

function prepare(obj) {
	// Стоп склада
	toOffBuild(obj)
	// Подготовка к авто секции
	toAuto(obj)
	// Переход в ручной режим секции
	toMan(obj)
	// Выкл секций
	toOff(obj)
	// Принудительное закрытие клапанов и выключение ВНО
	force(obj)
}

module.exports = prepare
