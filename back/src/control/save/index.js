const { data: store, retainDir, tracingDir } = require('@store')
const { createAndModifySync } = require('@tool/json')
const { positionVlv, cbPos, cbTune, cbSupply, cbSmoking, cbTracing } = require('./fn')
const retainStart = require('@tool/retain/start')

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
	if (Object.keys(store.engineHour).length) {
		await createAndModifySync(store.engineHour, 'ehour', tracingDir, cbTracing)
		store.engineHour={}
	}
}

module.exports = save
