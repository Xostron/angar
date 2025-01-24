const { stateV } = require('@tool/command/valve')
const { stateEq } = require('@tool/command/fan')
const { wrExtralrm, delExtralrm, isReset } = require('@store')
const { msg } = require('@tool/message')

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
	const state = stateV(vlvIn._id, value, building._id, vlvIn.sectionId[0])
	// Хотя бы один вентилятор запущен
	const run = fanS.some((f) => stateEq(f._id, value))

	// Логика
	// Текущее время
	const curTime = +new Date().getTime()
	// Инициализация функции:при отсутствии аварии - данные по аварии обнулены, приточный клапан изменил состояние
	if ((!acc.beginTime || !run || state != 'cls') && !acc.alarm) {
		// Временной интервал слежения за клапаном
		acc.beginTime = +new Date().getTime()
		acc.endTime = acc.beginTime + s.overVlv.time
		// Сигнал аварии
		acc.alarm = false
	}

	// Установка
	if (run && state === 'cls' && curTime >= acc.endTime && !acc.alarm) {
		acc.alarm = true
		acc.beginWait = +new Date().getTime()
		acc.endWait = acc.beginWait + s.overVlv.wait
		wrExtralrm(building._id, section._id, 'over_vlv', { date: new Date(), ...msg(building, section,14) })
	}

	// Сброс
	if (curTime >= acc.endWait || isReset(building._id)) {
		delete acc.alarm
		delete acc.beginTime
		delete acc.endTime
		delete acc.beginWait
		delete acc.endWait
		delExtralrm(building._id, section._id, 'over_vlv')
	}
	return acc?.alarm ?? false 
}

module.exports = overVlv


