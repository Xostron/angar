const { ctrlV } = require('@tool/command/module_output')
const { vlvPercent } = require('./fn')
const { data: store } = require('@store')
const { compareTime, remTime } = require('@tool/command/time')

/**
 * Управление выпускным клапаном
 * @param {*} idB ИД склада
 * @param {*} arrOut Массив выпускных клапанов
 * @param {*} obj Глобальные данные
 * @param {*} acc Аккумулятор для расчетов
 * @param {*} s Настройки
 */
function fnCtrl(idB, arrOut, obj, acc, s, forceOff) {
	// Управление выпускным клапаном
	for (const v of arrOut) {
		// Текущая позиция выпускного клапана, %
		const pos = vlvPercent(v._id, obj.retain?.[idB])
		// Направление клапана открыть/закрыть/стоп
		const open = acc[v._id].target > pos + store.tDeadzone
		const t = pos - store.tDeadzone < 0 ? 0 : pos - store.tDeadzone
		const close = acc[v._id].target < t
		let type = open ? 'open' : 'close'
		if (!open && !close) type = 'stop'
		if (forceOff) type = 'close'
		// Выбор типа управления: шаговый/прямой
		fnSelect(idB, v, type, obj, acc, s)
	}
	console.log(4400, 'flying/step', acc)
}

/**
 * Проверка условий для шагового открытия выпускного клапана
 * @param {*} obj
 * @param {*} acc
 * @param {*} s
 * @returns true - управление по шагам, false - обычное управление
 */
function fnCheck(obj, acc, s) {
	const tout = obj?.value?.total?.tout?.min
	console.log(4411, 'fnCheck', tout, s.sys.outStep, s.cooling.hysteresisOut)
	if (tout <= s.sys.outStep) acc.byStep = new Date()
	if (acc?.byStep && tout > s.sys.outStep + s.cooling.hysteresisOut) delete acc?.byStep
	console.log(
		4400,
		!!acc?.byStep ? 'Управление по шагам' : 'обычное открытие',
		'выпускным клапаном'
	)
	return !!acc?.byStep
}

/**
 * Выбор типа управления: шаговый/прямой для отдельного клапана
 * 1. Если температура улицы < Настройки "Температура улицы для открытия
 * выпускного клапана по шагам" - управление по шагам на открытие
 * 2. Обычное открытие клапана
 * Закрытие склада  - всегда обычное
 * @param {*} idB ИД склада
 * @param {*} v Рама клапана
 * @param {*} type Тип команды: open, close, stop
 * @param {*} obj Глобальный объект склада
 * @param {*} s Настройки
 * @param {*} acc Аккумулятор
 */
function fnSelect(idB, v, type, obj, acc, s) {
	// Стоп, закрыть
	if (['stop', 'close'].includes(type)) {
		ctrlV(v, idB, type)
		return
	}
	// Открыть
	if (fnCheck(obj, acc, s)) {
		fnStep(idB, v, type, obj, acc, s)
		return
	}
	// Обычное открытие - очистка аккумулятора шагового управления
	delete acc?.[v._id]?.work
	delete acc?.[v._id]?.wait
	ctrlV(v, idB, 'open')
}

// Шаговое управление выпускным клапаном
function fnStep(idB, v, type, obj, acc, s) {
	if (!s) return
	// Время шага
	acc[v._id].work ??= new Date()
	let time = compareTime(acc[v._id].work, s.sys.step * 1000)

	// 1. Время шага не прошло - открываем
	if (!time) {
		ctrlV(v, idB, 'open')
		return
	}
	// 2. Время шага прошло - ждем (останавливаем клапан)
	ctrlV(v, idB, 'stop')
	acc[v._id].wait ??= new Date()
	// console.log('Ждем следующего шага', s.sys.wait, remTime(acc[v._id].wait, s.sys.wait * 1000))
	time = compareTime(acc[v._id].wait, s.sys.wait * 1000)
	// 3. Время ожидания прошло - очищаем аккумулятор - цикл запускается далее
	if (time) {
		delete acc?.[v._id]?.work
		delete acc?.[v._id]?.wait
	}
}

module.exports = fnCtrl
