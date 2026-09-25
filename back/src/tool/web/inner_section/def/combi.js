const { listSec, fnSensByType, fnFanBySec } = require('./fn')
const { fnSens, clrsMode } = require('@tool/web/bld_card/fn')
const sp = require('@root/routes/api/tenta/read/store/transform/sp')
const { data: store } = require('@store')
const { getClr } = require('@tool/command/mech/fn')
const { getStateClr } = require('@tool/cooler')

/**
 * Содержимое секции (Обычный склад)
 * @param {*} bld
 * @param {*} sec
 * @param {*} obj
 * @returns
 */
function innerCombi(bld, sec, obj, sCard) {
	const target = sp(bld._id, bld.type, obj?.retain?.[bld._id]?.automode)
	const t = fnCircuit(bld, sec, obj)
	console.log(11, t)
	return {
		// Список секций
		listSec: listSec(bld._id, obj.data?.section),
		// Режим секции: авто true, ручной false, выкл null|undefined
		mode: sCard?.[bld._id]?.[sec._id]?.mode,
		// Датчики
		sensor: [
			{ ...fnSens(bld._id, obj, 'hin', 'max', 'per', 'hin'), target: target?.hin ?? '--' },
			{ ...fnSens(sec._id, obj, 'p', 'max', 'Па', 'p'), target: target?.p },
			{ ...fnSens(sec._id, obj, 'tcnl', 'min', 'grad', 'tcnl'), target: target?.tcnl },
		],
		tprd: { ...fnSens(bld._id, obj, 'tprd', 'minmax', 'grad', 'tprd'), target: target?.tprd },
		// Датчики температуры продукта (Гистограмма)
		tprdChart: fnSensByType(sec._id, obj?.data?.sensor, obj, 'tprd'),
		// Клапаны
		valve: sCard?.[bld._id]?.[sec._id]?.valve,
		// ВНО
		fan: fnFanBySec(sec._id, obj?.data?.fan, obj),
		// Контур: ипаритель+агрегат
		circuit: {
			// Список испарители+агрегаты
			list: [],
			// Общий вентилятор испарителей
			fan: [],
		},
		// circuit: fnCircuit(bld, sec, obj),
		/*
		(Такого функционала еще нет в природе)
		Централь: Агрегат
		Теплообменник: кулер
		*/
	}
}

module.exports = innerCombi

function fnCircuit(bld, sec, obj) {
	// Рама испарителей
	const cooler = getClr(obj.data, sec._id)
	const r = getStateClr(sec._id, obj)

	const circuit = {
		// Список испарители+агрегаты
		list: [],
		// Общий вентилятор испарителей
		fan: [],
		// Информация для виджета контуров > 2
		title: cooler?.length > 2 ? 'Контуры в работе' : undefined,
		// Количество испарителей
		length: cooler?.length > 2 ? cooler.length : undefined,
		// Суммирующее состояние испарителей данной секции (если испарителей > 2)
		comState: cooler?.length > 2 ? clrsMode(bld._id, obj, sec._id).name : undefined,
	}

	console.log(88, bld.name, sec.name)
	return circuit
}
