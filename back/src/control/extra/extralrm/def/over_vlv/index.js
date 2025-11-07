const { msg } = require('@tool/message')
const { curStateV } = require('@tool/command/valve')
const { stateEq } = require('@tool/command/fan/fn')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
/**
 * Превышено время работы с закрытыми клапанами (работает только в авторежиме)
 * @param {*} bld Рама склада
 * @param {*} sect Рама секции
 * @param {*} obj Глобальный объект цикла
 * @param {*} s Настройки склада
 * @param {*} se Показания датчиков секции
 * @param {*} m Исполнительные механизмы
 * @param {*} acc Данные о вычисления доп. аварий
 * @param {*} data Данные от авторежима
 * Отмена выполнения программы exclude=true:
 * - Режим сушки - настройка Постоянный вентилятор = Вкл
 * @returns
 */
function overVlv(bld, sect, obj, s, se, m, automode, acc, data) {
	const { value } = obj
	const { vlvS, fanS } = m
	const { exclude } = data
	// Тип склада
	const bldType = obj?.value?.building?.[bld._id]?.bldType
	// Отмена выполнения подпрограммы
	if (exclude) return null
	// Настроек нет - функцию не выполняем
	if (!s.overVlv.time || !s.overVlv.wait || exclude) return null

	// Приточный клапан секции
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	const state = curStateV(vlvIn._id, value)
	// Хотя бы один вентилятор запущен
	const run = fanS.some((f) => stateEq(f._id, value))

	// Логика
	// Фиксируем точку отсчета, когда приточный клапан закрыт с работающими ВНО
	if (state == 'cls' && run && !acc.begin) {
		acc.begin = new Date()
	}
	// Если клапан не закрыт или ВНО остановлены - отключаем слежение
	if (state != 'cls' || !run) {
		delete acc.begin
	}
	// Слежение - истекло ли разрешенно время закрытых клапанов
	const time = compareTime(acc.begin, s.overVlv.time)

	// Истекло -> авария и фиксация времени ожидания сброса аварии
	if (time && !acc.end) {
		acc.end = new Date()
		wrExtralrm(bld._id, sect._id, 'overVlv', msg(bld, sect, 14))
	}

	// Ожидание сброса аварии или нажата кнопка "Сброс аварии" или склад комби-холод
	if (compareTime(acc.end, s.overVlv.wait) || bldType !== 'normal') {
		delete acc.begin
		delete acc.end
		delExtralrm(bld._id, sect._id, 'overVlv')
	}

	return time ?? false
}

module.exports = overVlv
