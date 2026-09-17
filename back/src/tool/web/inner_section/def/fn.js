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

module.exports = { listSec, fnSensByType, fnFanBySec }
