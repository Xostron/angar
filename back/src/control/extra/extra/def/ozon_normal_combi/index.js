const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime, remTime } = require('@tool/command/time')
const { arrCtrlDO } = require('@tool/command/module_output')
const { msgB } = require('@tool/message')
const { fnClear } = require('@tool/smoking_ozon/fn')
const fnPrepare = require('./fn/prepare')
const { checkReady, checkOn } = require('./fn/check')
const soft = require('@tool/smoking_ozon/soft')
const h = 3600000
/**
 * Окуривание для Обычного и Комби склада:
 * 1 ВЫКЛЮЧИТЬ склад, переключить секции в АВТО!!!
 * (если секции будут в ручном или выключены, ВНО не включатся)
 * 2 Зайти в настройки "Озонатор": Настроить время,
 * в поле "ВКЛЮЧИТЬ" выбрать ВКЛ -> Сохранить настройки -> Озонация включена
 * 3. Озонация в работе (1 этап из 2) - это работают ВНО
 * 4. По истечению времени работы Озонации -> выкл ВНО
 * 5. Появляется сообщение "Озонация ожидание (2 этап из 2)"
 * 6. Время ожидания истекло: Склад включается и начинает работать в авторежиме
 * Работа ВНО: вкл разгонный, работаю секции которые в авто,
 * плавный пуск всех ВНО с регулированием по давлению
 * @param {*} bld
 * @param {*} section
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} alarm
 * @param {*} acc
 * @param {*} data
 * @param {*} ban
 * @param {*} resultFan
 * @param {*} clear
 * @returns
 */
function ozon(bld, section, obj, s, se, m, alarm, acc, data, ban, resultFan, clear = false) {
	const idB = bld._id
	if (clear) return fnClear(idB, 'ozon')

	// Подготовка данных
	const prepare = fnPrepare(bld, obj, s, m)
	const { oacc, oz, fanA, fan, accelMode, stg, idsS } = prepare
	console.log(
		11,
		'Озонатор',
		prepare?.oacc,
		'oz.arr=',
		prepare?.oz?.arr?.length,
		'ready=',
		prepare?.oz?.ready
	)

	// Проверка готовности
	if (!checkReady(bld, s, prepare)) return
	// Запрет озонатора: нет настроек, озонация выкл, склад вкл
	if (!checkOn(bld, obj, s, prepare)) return

	// Включено окуривание
	delExtra(idB, null, 'ozon3')
	// Работаем - включаются вентиляторы
	oacc.work ??= new Date()
	let time = compareTime(oacc.work, stg.work * h)
	// Время работы не прошло И озонатор готов => Работа
	if (!time && oz.ready) {
		wrExtra(idB, null, 'ozon1', msgB(bld, 91, `Работа ${remTime(oacc.work, stg.work * h)}`))
		delExtra(idB, null, 'ozon2')
		// Вкл разгонные
		arrCtrlDO(idB, fanA, 'on')
		arrCtrlDO(idB, oz.arr, 'on')
		// Вкл ВНО секции
		soft(idB, idsS, fan, obj, s, true, 'ozon')
		delete oacc?.wait
		return
	}

	// Время работы прошло ИЛИ озонатор неисправен
	oacc.wait ??= new Date()
	wrExtra(idB, null, 'ozon2', msgB(bld, 91, `Ожидание ${remTime(oacc.wait, stg.wait * h)}`))
	delExtra(idB, null, 'ozon1')
	arrCtrlDO(idB, fanA, 'off')
	arrCtrlDO(idB, oz.arr, 'off')
	soft(idB, idsS, fan, obj, s, false, 'ozon')

	// Время ожидания прошло - завершаем озонацию
	time = compareTime(oacc.wait, stg.wait * h)
	if (time) clear(idB, oacc, null)
}

module.exports = ozon
