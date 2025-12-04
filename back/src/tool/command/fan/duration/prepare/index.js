const { readAcc } = require('@store/index')
const { isCombiCold } = require('@tool/combi/is')
const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { data: store } = require('@store')
const { getIdsS } = require('@tool/get/building')

// Подготовка данных для работы доп. вентиляции
function fnPrepare(bld, obj, s, resultFan, bdata) {
	const cmd = fnStart(bld, obj, resultFan)
	// Комби-холодильник
	const isCC = isCombiCold(bld, bdata.automode, s)
	// Комби-обычный
	const isCN = !isCC
	// Обычный
	const isN = bld.type === 'normal'
	// Аварии авторежима
	const alrAuto = isAlr(bld._id, bdata.automode)
	// Режим хранения. Достиг задания
	const achieve = def[bld.type](bld._id, bdata.automode, isCN)
	// Аккумулятор внутренней и доп вентиляции
	const acc = readAcc(bld._id, 'building', 'vent')
	const notDur = resultFan.notDur.includes(true)
	// ID секций
	const idsS = getIdsS(obj.data.section, bld._id)
	const bstart = obj.retain?.[bld._id]?.start
	const secAuto = idsS.some((idS) => obj.retain?.[bld._id]?.mode?.[idS])
	//
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	return {
		acc,
		cmd,
		isCC,
		isCN,
		isN,
		alrAuto,
		notDur,
		achieve,
		idsS,
		s,
		bstart,
		secAuto,
		extraCO2,
	}
}

// Команды на управление плавным пуском
function fnStart(bld, obj, resultFan) {
	const { start, force, notDur } = resultFan
	return {
		// true: плавный пуск в работе
		start: start.includes(true),
		// true: плавный пуск принудительно запущен
		force: force.includes(true),
		// true: аварийная ситуация на складе
		notDur: notDur.includes(true),
	}
}

const def = {
	/**
	 * Обычный склад: Режим хранения. Достиг задания
	 * @param {string} idB
	 * @param {string} am
	 * @returns false - не достиг задания
	 */
	normal(idB, am) {
		// Игнорируем ДВ при сушке. В режиме сушки нет сообщения "достиг задания"
		if (am !== 'cooling') return false
		// Режим хранения
		return isAchieve(idB, am, 'finish')
	},

	/**
	 * Комби-обычный склад: Режим хранения. Достиг задания
	 * @param {string} idB
	 * @param {string} am
	 * @param {boolean} isCN
	 * @returns false - не достиг задания
	 */
	combi(idB, am, isCN) {
		// Комби-холодильник. Игнорируем ДВ
		if (!isCN) return false
		// Игнорируем при сушке
		if (am !== 'cooling') return false
		return isAchieve(idB, 'combi', 'finish')
	},
}

module.exports = {fnPrepare, def}
