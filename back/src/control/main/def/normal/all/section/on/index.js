const def = require('@control/main/def/normal/def')
const check = require('@tool/command/section/check')
const {extra} = require('@control/extra/extra')
const { valve } = require('./fn')
const auto = require('./auto')

// Обработка секции в авторежиме
function sectionOn(building, sect, obj, s, se, seB, m, am, accAuto, resultFan, start, alrB, alrAlways) {
	// Проверка секции (Если условия для авто не подходят, то ничего не делаем и очищаем аккумулятор авто)
	if (!check(building._id, sect, obj, am, start)) return clear(accAuto)
	// Логика авторежима {Суммарная авария, команды клапана}
	const { alr, v } = auto(building, sect, obj, s, se, seB, m, am, accAuto, resultFan, alrB, alrAlways)
	// Секция: Дополнительные функции авторежимов
	extra(building, sect, obj, s, se, m, alr, resultFan, def[am].toExtra(s, alr, sect._id, accAuto))

	// Приточный клапан (шаговое управление)
	valve(building, sect, m.vlvS, m.fanS, obj, alr, v, accAuto, s)
}

module.exports = sectionOn

// Очистка объекта (удаление по ключам, чтобы не терять ссылку на объект)
function clear(obj) {
	if (!Object.keys(obj).length) return
	for (const key in obj) {
		delete obj[key]
	}
}
