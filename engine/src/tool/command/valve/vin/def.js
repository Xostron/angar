const { ctrlV, ctrlVsp } = require('@tool/command/module_output')
const { data: store } = require('@store')
const { compareTime, remTime } = require('../../time')

/**
 * Управление по шагам
 * @param {*} idB
 * @param {*} idS
 * @param {*} prepare
 * @returns
 */
function fnStep(idB, idS, prepare, acc) {
	// Очистка аккумулятора sp
	clear('step', acc)
	const { aCmd, vlvIn, tStep, tWait } = prepare
	// Включаем клапан
	acc.work ??= new Date()
	let time = compareTime(acc.work, tStep)

	// Время шага не прошло - включаем клапан
	if (!time) {
		// console.log(99005, 'Включаем клапан', aCmd.type, remTime(acc.work, tStep))
		ctrlV(vlvIn, idB, aCmd.type)
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
 * Управление по процентам открытия (для удаления СО2 в комби-холодильнике)
 * @param {*} idB
 * @param {*} idS
 * @param {*} prepare
 */
function fnSp(idB, idS, prepare, acc) {
	// Очистка аккумулятора step
	clear('sp', acc)
	const { aCmd, vlvIn, tStep, tWait } = prepare

	if (!acc?.sp) {
		ctrlVsp(vlvIn, idB, aCmd.sp)
		acc.sp = new Date()
	}
}

/**
 * Сброс аккумулятора в зависимости от типа управления приточным клапаном
 * @param {*} code
 * @param {*} acc
 */
function clear(code, acc) {
	switch (code) {
		case 'step':
			delete acc?.sp
			break
		case 'sp':
			delete acc?.work
			delete acc?.wait
			break
	}
}

module.exports = { fnStep, fnSp }
