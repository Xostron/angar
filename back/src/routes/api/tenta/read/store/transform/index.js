const { checkS } = require('@tool/get/sensor');
const { readOne } = require('@tool/json');
const { data: store } = require('@store');
const { getIdBS } = require('@tool/get/building')
const secDef = require('./section');
const alarm = require('./alarm');
const banner = require('./banner');
const sections = require('./sections');
const push = require('./push');
/**
 * Трансформация данных о здании и секциях с использованием сенсоров и оборудования.
 *
 * @param {Object} bldData - Входные данные здания, которые необходимо трансформировать.
 * @param {String} bldId - Идентификатор здания.
 * @param {String} secId - Идентификатор секции (если нужно получить полные данные по секции).
 * @returns {Object} Объект с результатами трансформации.
 */
async function transform(bldId, secId) {
	try {
		let result = { value: {} }
		// Получаем данные для конкретного здания из хранилища
		const bldData = store?.value?.retain?.[bldId]
		const data = store?.value
		// Читаем раму json
		const p = [
			readOne('sensor'), // Считываем данные сенсоров
			readOne('fan'), // Считываем данные вентиляторов
			readOne('heating'), // Считываем данные обогревателей
			readOne('valve'), // Считываем данные клапанов
			readOne('section'), // Считываем данные секций
			readOne('building'), // Считываем данные складов
		];
		const [sensor, fan, heating, valve, section, building] =
			await Promise.all(p);
		// Тип склада
		const type = building?.find((el) => el._id === bldId)?.type;
		// Поиск разгонного вентилятора, принадлежащего зданию
		let idsS = getIdBS(section, bldId);
		let f = fan.filter(
			(el) => idsS.includes(el.owner.id) && el.type === 'accel'
		);
		f = f.some((el) => data?.[el?._id]?.state === 'run') ? 'run' : 'stop';

		result['bldId'] = bldId
		// Включен/выкл склад
		result[bldId + 'on'] = bldData?.start ?? null
		// Продукт, хранящийся в складе
		result[bldId + 'product'] = bldData?.product?.code ?? null
		// Режим склада
		result[bldId + 'mode'] =
			store.value?.building?.[bldId]?.submode?.[0] ??
			bldData?.automode ??
			null;
		// Сообщение авторежима
		result[bldId + 'note'] = data.alarm?.achieve?.[bldId] ?? null;
		result[bldId + 'crash'] = data.alarm?.count?.[bldId] ?? 0;
		result[bldId + 'alarm'] = alarm(bldId, null, data) ?? null;
		result[bldId + 'banner'] = banner(bldId, data) ?? null;
		result[bldId + 'push'] = push(bldId, data) ?? null;
		// Разгонный вентилятор склада
		result[bldId + 'accel'] = f
		// Абсолютная влажность продукта
		result[bldId + 'ahb'] = {
			value: data?.humAbs?.in?.[bldId],
			state: checkS(
				data?.total?.[bldId]?.hin?.state,
				data?.total?.[bldId]?.tprd?.state
			),
		};
		// Температура потолка (мин)
		result[bldId + 'tempb'] = {
			value: data?.total?.[bldId]?.tin?.max?.toFixed(1) ?? undefined,
			state: data?.total?.[bldId]?.tin?.state,
		}
		// Относительная Влажность продукта (макс)
		result[bldId + 'rhb'] = {
			value: data?.total?.[bldId]?.hin?.max?.toFixed(1) ?? undefined,
			state: data?.total?.[bldId]?.hin?.state,
		}
		// Точка росы
		result[bldId + 'point'] = { value: data?.total?.[bldId]?.point }

		// Краткая информация по секциям (карточки)
		sections(bldId, type, section, data, { heating, valve, fan }, result)

		if (type !== 'cold') {
			// Расчетная абсолютная влажность улицы
			result['ah'] = {
				value: data?.humAbs?.out?.com,
				state: checkS(
					data?.total?.tout?.state,
					data?.total?.hout?.state
				),
			};
			// Температура улицы (мин)
			result['temp'] = {
				value: data?.total?.tout?.min?.toFixed(1) ?? undefined,
				state: data?.total?.tout?.state,
			};
			// Влажность улицы (макс)
			result['rh'] = {
				value: data?.total?.hout?.max?.toFixed(1) ?? undefined,
				state: data?.total?.hout?.state,
			};
		}
		// Если указан secId, обрабатываем полную информацию по секции
		if (secId && secId !== 'undefined') {
			// Объединяем результаты с полными данными по секции
			const o = { data, heating, sensor, fan, valve };
			if (secDef[type]) await secDef[type](result, secId, bldId, o);
		}
		//
		return result
	} catch (error) {
		console.log(error)
		throw error
	}
}
module.exports = transform
