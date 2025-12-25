const { data: store } = require('@store')
const {
	positionVlv,
	fnResult,
	fnCooling,
	fnDateBuild,
	fnDryingCount,
	fnResultValve,
} = require('./fn')
const fnWeb = require('./web')
const fnMobile = require('./mobile')
const Aboc = require('@tool/abort_controller')

/**
 * Агрегируем данные для сохранения в retain
 * @param {*} obj Глобальные данные процесса
 * @returns
 */
function transform(obj) {
	// Создаем область для каждого склада
	for (const { _id } of obj.data.building) store.retain[_id] ??= {}

	// 0. Расчет положения клапанов
	positionVlv(obj)
	// 1. Калибровка клапанов
	fnResultValve(store.tuneTime, 'valve')
	// 2. Положения клапанов
	fnResult(store.vlvPos, 'valvePosition')
	// 3. Потеря питания
	fnResult(store.supply, 'supply')
	// 4. Окуривание
	fnResult(store.smoking, 'smoking')
	// 5. Режим хранения cooling
	fnCooling(store.acc)
	// 6. Дата и время: вкл/выкл склада
	fnDateBuild(obj.data.building)
	// 7. Счетчик дней в авторежиме сушки
	fnDryingCount(obj.data.building)
	// 8. web - команды управления
	Aboc.call(fnWeb)()
	// 9. mobile - команды
	Aboc.call(fnMobile)()
}

module.exports = transform
