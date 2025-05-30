const { msg } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { stateV } = require('@tool/command/valve')
const { stateEq } = require('@tool/command/fan')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
/**
 * Превышено время работы с закрытыми клапанами
 * @param {*} building Рама склада
 * @param {*} section Рама секции
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
function overVlv(building, section, obj, s, se, m, automode, acc, data) {
	const { value } = obj
	const { vlvS, fanS } = m
	const { exclude } = data

	// Отмена выполнения подпрограммы
	if (exclude) return null
	// Настроек нет - функцию не выполняем
	if (!s.overVlv.time || !s.overVlv.wait || exclude) return null

	// Приточный клапан секции
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	const state = stateV(vlvIn?._id, value, building._id, vlvIn?.sectionId?.[0])
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
		wrExtralrm(building._id, section._id, 'overVlv', msg(building, section, 14))
	}

	// Ожидание сброса аварии или нажата кнопка "Сброс аварии"
	if (compareTime(acc.end, s.overVlv.wait) || isReset(building._id)) {
		delete acc.begin
		delete acc.end
		delExtralrm(building._id, section._id, 'overVlv')
	}

	return time ?? false
}

module.exports = overVlv
