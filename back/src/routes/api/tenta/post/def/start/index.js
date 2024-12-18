
/**
 * @param {*} o данные от web клиента {_id:buildId, value: true/false}
 * @param {*} data данные из файла json
 */
function cb(o, data) {
	// value - вкл/выкл склад (true/false)
	const { buildingId, value, obj } = o
	// доп настройки по режиму работы:
	// const { mode, day, fan, product } = obj
	if (typeof value !== 'boolean') return data
	// вкл склада
	data[buildingId] ??= {}
	data[buildingId].start = value

	// доп настройки
	// data[buildingId].setting.drying[product].ventillation = fan
	// data[buildingId].setting.drying[product].day = day
	return data
}
/* 
obj = {"buildingId":"65d4aed4b47bb93c40100fd5", "value":false}
obj = {"buildingId":"65d4aed4b47bb93c40100fd5", "value":true}
*/

module.exports = cb
