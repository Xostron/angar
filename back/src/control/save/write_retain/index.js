const { isExist, recovery } = require('./recovery')
const { createAndModifySync } = require('@tool/json')
const { data: store, retainDir } = require('@store')
const transform = require('./transform')
const {
	positionVlv,
	cbPos,
	cbTune,
	cbSupply,
	cbSmoking,
	cbCooling,
	cbDatestop,
	cbDryingCount,
} = require('../fn')

async function writeRetain(obj) {
	// Проверка и создание папки и файла retain
	isExist()
	// Проверка файла/восстановление файла
	const prime = await recovery()
	// Собираем здесь данные на запись в retain
	// store.retain = store.prime
	transform(obj, store.retain)
	console.log(410, store.retain)
}

async function writeRetainOld(obj) {
	// По складам
	for (const build of obj.data.building) {
		// Сохранение минимальной температуры продукта режима хранения (обычный склад)
		// Сохранение даты отсчета достижения продукт достиг задания
		await createAndModifySync(store.acc, 'data', retainDir, cbCooling)
		// Время вкл/выкл склада
		await createAndModifySync(build._id, 'data', retainDir, cbDatestop)
		// Счетчик дней в авторежиме сушки
		await createAndModifySync(build._id, 'data', retainDir, cbDryingCount)
	}
	// Обновление положения клапана
	positionVlv(obj)
	// Запись данных в retain (положение клапана)
	if (store.vlvPos) await createAndModifySync(store.vlvPos, 'data', retainDir, cbPos)
	if (store.tuneTime) await createAndModifySync(store.tuneTime, 'data', retainDir, cbTune)
	if (store.supply) await createAndModifySync(store.supply, 'data', retainDir, cbSupply)
	if (store.smoking) await createAndModifySync(store.smoking, 'data', retainDir, cbSmoking)
}

module.exports = { writeRetain, writeRetainOld }
