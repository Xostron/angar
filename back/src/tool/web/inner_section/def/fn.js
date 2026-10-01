const coolerDef = require("@dict/def/cooler")
const { getClr } = require("@tool/command/mech/fn")
const { getStateClr2, getStateClr } = require("@tool/cooler")
const { getOwner } = require("@tool/get/building")
const { clrsMode } = require("@tool/web/bld_card/fn")

function listSec(idB, section) {
	return section.filter((el) => el.buildingId == idB)
}

/**
 *
 * @param {*} idS ИД секции
 * @param {Object[]} sensor Рама датчиков
 * @param {*} obj Глобальные данные склада
 * @param {*} type Тип датчика
 * @returns {Object[]} Значения датчиков секции одного типа
 */
function fnSensByType(idS, sensor = [], obj, type) {
	return sensor
		.reduce((acc, el, i) => {
			if (el.owner.id !== idS || el.type != type) return acc
			acc.push({
				_id: el._id,
				value: obj.value[el._id]?.value,
				state: obj.value[el._id]?.state,
				order: el?.order ?? 0,
				name: el.name,
			})
			return acc
		}, [])
		.sort((a, b) => a.order - b.order)
}

/**
 *
 * @param {*} idS ИД секции
 * @param {*} fan Рама ВНО
 * @param {*} obj Глобальные данные
 * @param {*} type Тип ВНО
 * @returns {Object[]} Массив ВНО состояние и значение ПЧ
 */
function fnFanBySec(idS, fan = [], obj, type = 'fan') {
	return fan
		.reduce((acc, el, i) => {
			if (el.owner.id != idS || el.type != 'fan') return acc
			acc.push({
				_id: el._id,
				state: obj.value?.[el._id]?.state,
				value: obj.value?.[el._id]?.value,
				order: el.order,
			})
			return acc
		}, [])
		.sort((a, b) => a.order - b.order)
}

function fnCircuit(bld, sec, obj) {
	// Рама испарителей
	const cooler = getClr(obj.data, sec._id)

	if (cooler?.length > 2) return fn1(bld, sec, obj, cooler)
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

module.exports = { listSec, fnSensByType, fnFanBySec, fnComFanClr, fnCircuit }
