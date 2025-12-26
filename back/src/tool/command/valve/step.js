const { ctrlV } = require('@tool/command/module_output')
const { data: store } = require('@store')
const { compareTime, remTime } = require('../time')

function fnStep(vlvS, idB, idS, retain) {
	// Подготовка данных
	const prepare = fnPrepare(vlvS, idS)
	const { aCmd, vlvIn, tStep, tWait } = prepare

	// Разрешение на шаг
	if (!fnCheck(prepare, retain)) return

	// Управление
	// Аккумулятор
	store.watchdog ??= {}
	store.watchdog[vlvIn._id] ??= {}
	const acc = store.watchdog[vlvIn._id]

	// Включаем клапан
	acc.work ??= new Date()
	let time = compareTime(acc.work, tStep)

	// Время шага не прошло - включаем клапан
	if (!time) {
		console.log(99005, 'Включаем клапан', aCmd.type, remTime(acc.work, tStep))
		ctrlV(vlvIn, idB, aCmd.type,)
		return
	}

	// Время шага прошло - стоп клапана - задержка
	ctrlV(vlvIn, idB, 'stop')
	acc.wait ??= new Date()

	time = compareTime(acc.wait, tWait)
	// Задержка прошла - очищаем аккумулятор
	if (time) {
		store.watchdog[vlvIn._id] = null
		store.aCmd[idS].vlv = null
	}
}

/**
 * Разрешить управление
 * @param {*} prepare
 * @param {*} retain
 * @returns {boolean } false - Запрет управления, true - Разрешить управление
 */
function fnCheck(prepare, retain) {
	const { aCmd, vlvIn, tStep, tWait } = prepare
	// Причины отключения управления клапаном
	const reason = [
		!aCmd, // нет команд на откр/закр
		!retain.valve, // Ни один клапан не откалиброван
		!retain.valvePosition, //Ни уодного клапана нет текущей позиции
		!vlvIn, // В данной секции нет приточного клапана
		Number.isNaN(tStep), // Нет расчета шага (нет команд на откр/закр)
		Number.isNaN(tWait), // Нет расчета ожидания следующего шага (нет команд на откр/закр)
	]
	if (reason.some((el) => el)) {
		// Запрет управления
		console.log(99002, 'Управление отключено по причине', reason)
		return false
	}
	// Разрешить управление
	return true
}

function fnPrepare(vlvS, idS) {
	// Команда на управление
	const aCmd = store.aCmd?.[idS]?.vlv
	// Приточный клапан
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	// Время шага, мс
	const tStep = aCmd?.step * 1000 * aCmd?.kIn
	// Время ожидания следующего шага, мс
	const tWait = aCmd?.delay * 1000
	return { aCmd, vlvIn, tStep, tWait }
}

module.exports = fnStep

// Расчеты для работы клапана в режиме шага (Xсек - откр/закр, Yсек - стоит)
// Расчеты сохраняются в store.watchdog.[valveId]
// Если клапан еще отрабатывает шаг, то ждем пока он закончится (store.watchdog?.[vlvIn._id] == null)
function calcSoft(vlvIn, aCmd, retain) {
	// Расчеты приточного клапана уже сделаны - выходим
	if (!!store?.watchdog?.[vlvIn._id]) return store?.watchdog?.[vlvIn._id]
	// Инициализация
	store.watchdog ??= {}
	store.watchdog[vlvIn._id] = {}
	// Направление клапана
	store.watchdog[vlvIn._id].type = aCmd.type
	// Момент времени включения клапана
	const begin = +new Date().getTime()
	store.watchdog[vlvIn._id].start = new Date()
	// Момент времени отключения клапана (шаг)
	store.watchdog[vlvIn._id].step = aCmd.step * 1000 * aCmd.kIn
	store.watchdog[vlvIn._id].endStep = begin + aCmd.step * 1000 * aCmd.kIn
	// Момент времени завершения простоя клапана
	store.watchdog[vlvIn._id].delay = aCmd.delay * 1000
	store.watchdog[vlvIn._id].endDelay = store.watchdog[vlvIn._id].endStep + aCmd.delay * 1000
	// Шаг клапана, %
	store.watchdog[vlvIn._id].stepPer = (aCmd.step * 100) / +retain.valve[vlvIn._id]
	return store.watchdog[vlvIn._id]
}
