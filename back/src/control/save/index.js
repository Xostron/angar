const { data: store, retainDir, accDir } = require('@store')
const { createAndModifySync } = require('@tool/json')
const { positionVlv, cbPos, cbTune, cbSupply, cbSmoking, cbAcc } = require('./fn')
const retainStart = require('@tool/retain/start')
const { readOne } = require('@tool/json')

// Сохранение в файл retain (Настройки, режимы работы и т.д.)
async function save(obj) {
	// Выключение склада из админки:
	for (const build of obj.data.building) {
		// Выключение склада из админки:
		if (!build.on && obj.retain?.[build._id]?.start) {
			await retainStart({ _id: build._id, val: build.on })
		}
	}

	// Обновление положения клапана
	positionVlv(obj)
	// Запись данных в retain (положение клапана)
	if (store.vlvPos) await createAndModifySync(store.vlvPos, 'data', retainDir, cbPos)
	if (store.tuneTime) await createAndModifySync(store.tuneTime, 'data', retainDir, cbTune)
	if (store.supply) await createAndModifySync(store.supply, 'data', retainDir, cbSupply)
	if (store.smoking) await createAndModifySync(store.smoking, 'data', retainDir, cbSmoking)

	/**
	 * При первом запуске читаем аварии из файла
	 *  */
	if (store._first) {
		obj.acc = await readOne('acc.json', accDir)
		clear(obj.data, obj)
		store.alarm.module = obj.acc?.module
	}
	// Сохранение текущих аварий в файл
	await createAndModifySync(store.alarm, 'acc', accDir, cbAcc)
}

module.exports = save

function clear(data, obj){
const {building, module} = data
for (const bld of building) {
	for (const mdlId in obj.acc?.module?.[bld._id]) {
		if (module.find(el=>el._id===mdlId)) continue
		// Модуль не найден (удалить из аварий)
		delete obj.acc?.module?.[bld._id]?.[mdlId]
	} 
}

}