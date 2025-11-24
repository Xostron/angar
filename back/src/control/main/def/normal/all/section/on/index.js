const def = require('@control/main/def/normal/def')
const { check } = require('@tool/command/section')
const { extra } = require('@control/extra/extra')
const { valve } = require('./fn')
const auto = require('./auto')

// Обработка секции в авторежиме
function sectionOn(
	building,
	sect,
	obj,
	s,
	se,
	seB,
	m,
	am,
	accAuto,
	resultFan,
	start,
	alrBld,
	alrAm,
	alrAlw
) {
	// Проверка секции (Если условия для авто не подходят, то ничего не делаем)
	if (!check(building._id, sect, obj, am, start)) {
		console.log('\t', building.name, 'Секция не в работе', sect.name)
		return
	}
	console.log('\t', building.name, 'Секция в работе', sect.name)
	// clear(accAuto)
	// Логика авторежима {Суммарная авария, команды клапана}
	const { alr, v } = auto(
		building,
		sect,
		obj,
		s,
		se,
		seB,
		m,
		am,
		accAuto,
		resultFan,
		alrBld,
		alrAm,
		alrAlw
	)
	// Секция: Дополнительные функции авторежимов
	extra(building, sect, obj, s, se, m, alr, resultFan, def[am].toExtra(s, alr))
	// Приточный клапан (шаговое управление)
	valve(building, sect, m.vlvS, m.fanS, obj, alr, v, accAuto, s)
}

module.exports = sectionOn
