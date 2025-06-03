const { checkS } = require('@tool/get/sensor')
const { readOne } = require('@tool/json')
const { data: store } = require('@store')
const { getId } = require('@tool/command/mech')
const secDef = require('./section')
const alarm = require('./alarm')
const banner = require('./banner')
const sections = require('./sections')
/**
 * Трансформация данных о здании и секциях с использованием сенсоров и оборудования.
 *
 * @param {Object} bldData - Входные данные здания, которые необходимо трансформировать.
 * @param {String} idB - Идентификатор здания.
 * @param {String} secId - Идентификатор секции (если нужно получить полные данные по секции).
 * @returns {Object} Объект с результатами трансформации.
 */
async function transform(idB, secId) {
	try {
		// Получаем данные для конкретного здания из хранилища
		const bldData = store?.value?.retain?.[idB]
		const data = store?.value
		// Параллельно считываем необходимые данные
		const p = [
			readOne('sensor'), // Считываем данные сенсоров
			readOne('fan'), // Считываем данные вентиляторов
			readOne('heating'), // Считываем данные обогревателей
			readOne('valve'), // Считываем данные клапанов
			readOne('section'), // Считываем данные секций
			readOne('building'), // Считываем данные складов
		]
		const [sensor, fan, heating, valve, section, building] = await Promise.all(p)
		// Тип склада
		const type = building?.find((el) => el._id === idB)?.type
		// Поиск разгонного вентилятора, принадлежащего зданию
		let idsS = getId(section, idB)
		let f = fan.filter((el) => idsS.includes(el.owner.id) && el.type === 'accel')
		f = f.some((el) => data?.[el?._id]?.state === 'run') ? 'run' : 'stop'
		// Формируем объект с результатами для склада
		const result = {}
		// let result = {
		// Погода
		// weather: {},
		result['_id'] = idB
		// Включен/выкл склад
		result['on'] = bldData?.start ?? null
		// Продукт, хранящийся в складе
		result['product'] = bldData?.product?.code ?? null
		// Режим склада
		result['mode'] = store.value?.building?.[idB]?.submode?.[0] ?? bldData?.automode ?? null
		// Сообщение авторежима
		result['note'] = data.alarm?.achieve?.[idB] ?? null
		result['crash'] = data.alarm?.count?.[idB] ?? 0
		result['alarm'] = alarm(idB, null, data) ?? null
		result['banner'] = banner(idB, data) ?? null
		//Краткая информация по секциям
		// sections: sections(idB, section, data, { heating, valve, fan }) ?? null,
		// value: {
		// Разгонный вентилятор склада
		result['accelFan'] = f
		// Абсолютная влажность продукта
		result['ahb'] = {
			value: data?.humAbs?.in?.[idB],
			state: checkS(data?.total?.[idB]?.hin?.state, data?.total?.[idB]?.tprd?.state),
		}
		// Температура потолка (мин)
		result['tempb'] = {
			value: data?.total?.[idB]?.tin?.max?.toFixed(1) ?? undefined,
			state: data?.total?.[idB]?.tin?.state,
		}
		// Относительная Влажность продукта (макс)
		result['rhb'] = {
			value: data?.total?.[idB]?.hin?.max?.toFixed(1) ?? undefined,
			state: data?.total?.[idB]?.hin?.state,
		}
		// Точка росы
		result['point'] = { value: data?.total?.[idB]?.point }
		// },
		// }
		// Карточки секций
		sections(idB, section, data, { heating, valve, fan }, result)
		if (type !== 'cold') {
			// Расчетная абсолютная влажность улицы
			result[secId + 'ah'] = { value: data?.humAbs?.out?.com, state: checkS(data?.total?.tout?.state, data?.total?.hout?.state) }
			// Температура улицы (мин)
			result[secId + 'temp'] = { value: data?.total?.tout?.min?.toFixed(1) ?? undefined, state: data?.total?.tout?.state }
			// Влажность улицы (макс)
			result[secId + 'rh'] = { value: data?.total?.hout?.max?.toFixed(1) ?? undefined, state: data?.total?.hout?.state }
		}

		// Если указан secId, обрабатываем полную информацию по секции
		if (secId && secId !== 'undefined') {
			// Объединяем результаты с полными данными по секции
			const o = { data, heating, sensor, fan, valve }
			if (secDef[type]) await secDef[type](result, secId, idB, o)
		}
		// Возвращаем результаты трансформации для Виктора
		return result
	} catch (error) {
		// В случае ошибки возвращаем её
		console.log(error)
		return error
	}
}
module.exports = transform
