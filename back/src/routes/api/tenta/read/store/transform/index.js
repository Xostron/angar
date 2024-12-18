const { checkS } = require('@tool/command/sensor')
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
		const type = building?.find(el=>el._id === idB)?.type
		// Поиск разгонного вентилятора, принадлежащего зданию
		let idsS = getId(section, idB)
		let f = fan.filter((el) => idsS.includes(el.owner.id) && el.type === 'accel')
		f = f.some((el) => data?.[el?._id]?.state === 'run') ?'run' : 'stop'

		// Формируем объект с результатами для склада
		let result = {
			// Погода
			// weather: {},
			_id: idB,
			// Включен/выкл склад
			on: bldData?.start ?? null,
			// Продукт, хранящийся в складе
			product: bldData?.product?.code ?? null,
			// Режим склада
			mode: bldData?.automode ?? null,
			// Сообщение авторежима
			note: data.alarm?.achieve?.[idB] ?? null,
			alarm: alarm(idB, null, data)?? null, 
			banner: banner(idB, data)?? null,
			//Краткая информация по секциям
			sections: sections(idB, section, data, {heating, valve, fan}) ?? null,
			value: {
				// Разгонный вентилятор склада
				fan: f,
				// Абсолютная влажность продукта
				ahb: {
					value: data?.humAbs?.[idB],
					state: checkS(data?.total?.[idB]?.hin?.state, data?.total?.[idB]?.tprd?.state),
				},
				// Температура потолка (мин)
				tempb: {
					value: data?.total?.[idB]?.tin?.max?.toFixed(1) ?? undefined,
					state: data?.total?.[idB]?.tin?.state,
				},
				// Относительная Влажность продукта (макс)
				rhb: {
					value: data?.total?.[idB]?.hin?.max?.toFixed(1) ?? undefined,
					state: data?.total?.[idB]?.hin?.state,
				},
			}
		}
		if(type !== 'cold') {
			// Расчетная абсолютная влажность улицы
			result.value.ah = { value: data?.humAbs?.out, state: checkS(data?.total?.tout?.state, data?.total?.hout?.state) }	
			// Температура улицы (мин)
			result.value.temp = { value: data?.total?.tout?.min?.toFixed(1) ?? undefined, state: data?.total?.tout?.state }
			// Влажность улицы (макс)
			result.value.rh = { value: data?.total?.hout?.max?.toFixed(1) ?? undefined, state: data?.total?.hout?.state }
		}
		
		// Если указан secId, обрабатываем полную информацию по секции
		if (secId && secId !== 'undefined') {
			// Объединяем результаты с полными данными по секции
			const o = {data, heating, sensor, fan, valve}
			if(secDef[type]) await secDef[type](result, secId, idB, o)
		}
		// Возвращаем результаты трансформации для Виктора
		return result

	} catch (error) {
		// В случае ошибки возвращаем её
		console.log(error);
		return error
	}
}
module.exports = transform