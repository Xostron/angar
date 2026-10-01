const { listSec, fnSensByType, fnFanBySec } = require('./fn')
const { fnSens, clrsMode } = require('@tool/web/bld_card/fn')
const sp = require('@root/routes/api/tenta/read/store/transform/sp')
const { data: store } = require('@store')
const { getClr } = require('@tool/command/mech/fn')
const { getStateClr2, getStateClr } = require('@tool/cooler')
const coolerDef = require('@dict/def/cooler')
const { getOwner } = require('@tool/get/building')

/**
 * Содержимое секции (Обычный склад)
 * @param {*} bld
 * @param {*} sec
 * @param {*} obj
 * @returns
 */
function innerCombi(bld, sec, obj, sCard) {
	const target = sp(bld._id, bld.type, obj?.retain?.[bld._id]?.automode)
	// const t = fnCircuit(bld, sec, obj)
	// console.log(11, t)
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
		circuit: fnCircuit(bld, sec, obj),
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

	if (cooler?.length >= 2) return fn1(bld, sec, obj, cooler)
	return fn2(bld, sec, obj, cooler)
}

// Карточки испарителей > 2 контуров
function fn1(bld, sec, obj, coolerS = []) {
	const fans = coolerS
		.flatMap((el) => el?.fan)
		.map((f) => {
			return { _id: f._id, ...obj.value?.[f._id] }
		})
	const isRunCount = getStateClr(sec._id, obj).filter((st) => st !== 'off-off-off')?.length ?? 0
	const circuit = {
		title: 'Контуры в работе',
		// Контуры - Количество испарителей
		len: `${isRunCount}/${coolerS.length}`,
		// Суммирующее состояние испарителей данной секции (если испарителей > 2)
		comState: clrsMode(bld._id, obj, sec._id).name,
		fans,
	}
	return circuit
}

// Карточка испарителей <=2 контура
function fn2(bld, sec, obj, coolerS = []) {
	const circuit = {}
	// Список испарители+агрегаты
	// Имя, давление всасв/нагн, агрегат вкл/выкл,
	// вент конденсатора, состояние испарителя, вно испарителя
	circuit.list = coolerS.map((el) => {
		const condenser = Object.values(obj.value?.[el?.aggregateListId]?.condenser ?? {})?.[0]
			?.state
		const r = {
			name: el.name,
			// Состояние агрегата
			aggregate: {
				state: obj.value?.[el?.aggregateListId]?.state,
				value: dictAgg?.[obj.value?.[el?.aggregateListId]?.state],
			},
			// Состояние конденсатора
			condenser: { state: condenser, value: condenser == 'run' ? '100%' : '0%' },
			// Состояние испарителя
			state: coolerDef?.[getStateClr2(el, obj)],
			// ВНО испарителя
			fan: el?.fan?.map((f) => obj.value?.[f._id])?.[0],
			// Темп испарителя
			tmpCooler: obj.value.total?.[sec._id]?.cooler?.[el._id]?.tmpCooler,
			// Давл всасывания
			pin: obj.value.total?.[sec._id]?.cooler?.[el._id]?.pin,
			// Давл.нагнетания
			pout: obj.value.total?.[sec._id]?.cooler?.[el._id]?.pout,
		}
		return r
	})
	// Общий вентилятор у двух испарителей
	circuit.comfan = fnComFanClr(bld._id, coolerS, obj)

	return circuit
}

/**
 * @param {*} coolerS Массив испарителей секции
 * @param {*} obj
 * @returns {Object[]}Поиск у испарителей секции общих ВНО
 */
function fnComFanClr(idB, coolerS = [], obj) {
	const com = Object.values(
		coolerS
			.flatMap((el) => el.fan)
			.reduce((acc, f, i) => {
				if (acc[f.module.id + f.module.channel]) {
					// Найден общий вно
					acc[f.module.id + f.module.channel].common = true
					// Владелец испарителя
					const id = getOwner(f, obj.data)?.sect?._id
					const prev = acc[f.module.id + f.module.channel]
					const off = obj.retain?.[idB]?.fan?.[id]?.[prev._id]
					// Если первый ВНО из дублированных введен в работу оставляем его
					if (!off) return acc
					else {
						acc[f.module.id + f.module.channel].common = true
						return acc
					}
				}
				acc[f.module.id + f.module.channel] = f
				return acc
			}, {}) ?? {},
	)
		.filter((el) => el.common)
		.map((el) => {
			return {
				_id: el._id,
				...(obj?.value?.[el._id] ?? {}),
			}
		})

	return com
}

const dictAgg = {
	stop: 'выкл',
	run: 'вкл',
	alarm: 'выкл',
	undefined: 'выкл',
	null: 'выкл',
	'': 'выкл',
}
