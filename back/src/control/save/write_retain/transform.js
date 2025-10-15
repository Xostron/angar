const { data: store } = require('@store')
const { positionVlv, fnResult, fnCooling, fnDateBuild, fnDryingCount } = require('./fn')
const fnWeb = require('./web')
// const fnMobile = require('./mobile')

/**
 * Агрегируем данные для сохранения в retain
 * @param {*} obj Глобальные данные процесса
 * @param {*} result данные retain - инициализируются при старте от файла retain,
 * затем модифицируется каждый раз в цикле и записывается в файл retain
 * @returns
 */
function transform(obj, result) {
	// Создаем область для каждого склада
	for (const { _id } of obj.data.building) result[_id] ??= {}

	// 0. Расчет положения клпанов
	positionVlv(obj)
	// 1. Калибровка клапанов
	fnResult(store.tuneTime, result, 'valve')
	// 2. Положения клапанов
	fnResult(store.vlvPos, result, 'valvePosition')
	// 3. Потеря питания
	fnResult(store.supply, result, 'supply')
	// 4. Окуривание
	fnResult(store.smoking, result, 'smoking')
	// 5. Режим хранения cooling
	fnCooling(store.acc, result)
	// 6. Дата и время: вкл/выкл склада
	fnDateBuild(obj.data.building, result)
	// 7. Счетчик дней в авторежиме сушки
	fnDryingCount(obj.data.building, result)
	// web - команды управления
	fnWeb(result)
	// mobile - команды
	// fnMobile(result)
}

module.exports = transform
