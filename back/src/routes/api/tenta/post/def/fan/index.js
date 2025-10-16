const { createAndModifySync, findOne } = require('@tool/json')
const { setCmd } = require('@tool/command/set')
const { data: store, retainDir } = require('@store')

async function cmd(obj) {
	try {
		const { buildingId, fanId, value, ao = null } = obj
		const fan = await findOne('fan', { key: '_id', v: fanId })
		const sectionId = fan?.owner.id
		// Вывести из работы
		if (value === 'off') {
			const o = { buildingId, sectionId, fanId, value: true }
			store.mobile ??= {}
			store.mobile.fan = o
			await createAndModifySync(o, 'data', retainDir, cb)
			return true
		}
		// ввод/вывод в/из работы
		const o = { buildingId, sectionId, fanId, value: false }
		store.mobile ??= {}
		store.mobile.fan = o
		await createAndModifySync(o, 'data', retainDir, cb)
		// Пуск/стоп - дискретный выход
		const moduleId = fan.module.id
		const channel = fan.module.channel - 1
		const val = value === 'run' ? { [channel]: 1 } : { [channel]: 0 }
		let s = {
			[buildingId]: {
				[moduleId]: val,
			},
		}
		setCmd(s)
		// Аналоговый выход
		const binding = await findOne('binding', { key: ['owner', 'id'], v: fanId })
		if (!binding) return true

		// Блокировка включения с 0%
		if (ao !== null && Number(ao) <= 0 && value == 'run') {
			const val = { [channel]: 0 }
			const s = {
				[buildingId]: {
					[moduleId]: val,
					[binding.moduleId]: { [binding.channel - 1]: 0 },
				},
			}
			setCmd(s)
			return true
		}
		// Обычное включение с АО
		s = {
			[buildingId]: {
				[moduleId]: val,
				[binding.moduleId]: { [binding.channel - 1]: value == 'run' ? +ao : 0 },
			},
		}
		console.log(333, s)
		setCmd(s)
		return true
	} catch (error) {
		return error
	}
}

/**
Fan
{"buildingId":"65d4aed4b47bb93c40100fd5", "fanId":"65d73c5fa9730d2218d419ed", "value":"stop"} 
{"buildingId":"65d4aed4b47bb93c40100fd5", "fanId":"65d73c5fa9730d2218d419ed", "value":"start"} 
{"buildingId":"65d4aed4b47bb93c40100fd5", "fanId":"65d73c5fa9730d2218d419ed", "value":"off"} 
*/

module.exports = cmd

/**
 * Вентиляторы - вывод из работы
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	const { buildingId, sectionId, fanId, value } = obj
	data[buildingId] ??= {}
	data[buildingId].fan ??= {}
	data[buildingId].fan[sectionId] ??= {}
	data[buildingId].fan[sectionId][fanId] = value
	return data
}
/* 
obj = {"buildingId":"65d4aed4b47bb93c40100fd5", "sectionId":"65d4aee3b47bb93c40100fd6", "fanId":"65d73cda52921647f4994d59", "value":false}

*/
