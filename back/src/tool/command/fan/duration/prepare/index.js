const { readAcc } = require('@store/index')
const { isCombiCold } = require('@tool/combi/is')
const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { data: store } = require('@store')
const { getIdsS } = require('@tool/get/building')

// Подготовка данных для работы доп. вентиляции
function fnPrepare(bld, obj, s, resultFan, bdata) {
	const cmd = fnStart(bld, obj, resultFan)
	// Комби-обычный
	const isCN = !isCombiCold(bld, bdata.automode, s)
	// Обычный
	const isN = bld.type === 'normal'
	// Аварии авторежима
	const alrAuto = isAlr(bld._id, bdata.automode)
	// Режим хранения. Достиг задания
	const achieve = def[bld.type](bld._id, bdata.automode, isCN)
	// Аккумулятор
	const acc = readAcc(bld._id, 'building', 'vent')
	const notDur = resultFan.notDur.includes(true)
	// ID секций
	const idsS = getIdsS(obj.data.section, bld._id)
	return { acc, cmd, isCN, isN, alrAuto, notDur, achieve, idsS, s }
}

//
function fnStart(bld, idsS, obj, resultFan) {
	if (resultFan.force.includes(true)) return { start: false, force: true }

	const o = {}
	idsS.forEach((idS) => {
		o.start = o.start || store.aCmd?.[idS]?.fan.type === 'on'
		o.force = o.force || store.aCmd?.[idS]?.fan.force
	})
	return o
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

module.exports = fnPrepare
