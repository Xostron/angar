const { data: store } = require('@store/index')

/**
 * Анализ: Формирование значений входов/выходов, режим работы секции, вкл/выкл склада
 * @param {*} val сырые данные с опроса модулей
 * @param {*} obj объект данных для работы основного цикла
 * @returns
 */
function value(obj) {
	const bldCard = fnBldCard(obj)

	console.log(234, bldCard)
	// Данные для web клиента
	return {
		...(obj.value ?? {}),
		retain: obj.retain,
		factory: obj.factory,
		time: new Date(),
		bldCard,
	}
}

module.exports = value

// function fnDiff(curr, prev){
// 	for (const key in curr){
// 		if (curr[key] instanceof Object) fnDiff(curr[key],prev[key])
// 			else{

// 			}
// 	}
// }

// store.value = { ...obj.value, retain:obj.retain, factory:obj.factory, alarm: r }
function fnBldCard(obj) {
	if (!obj.data?.building) return null

	return obj.data.building.reduce((acc, bld) => {
		// Режим работы: агрегация режимов секций
		// const mode
		// console.log(obj?.value?.total)
		acc[bld._id] = {
			order: bld.order,
			name: bld.name,
			type: bld.type,
			code: bld.code,
			countAlr: store.value?.alarm?.count?.[bld._id] ?? 0,
			mode: obj?.value?.total?.[bld._id]?.mode?.[1],
			product:obj.retain?.[bld._id]?.product?.name,
automode:obj?.value?.total?.[bld._id]?.automode
		}
		return acc
	}, {})
}
