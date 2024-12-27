const { setCmd, data: store } = require('@store');
const tracking = require('@tool/command/tracking');
const { aFind } = require('@tool/obj');
// Преобразование команд управления в выхода модулей
/**
 * @param {*} obj Данные основного цикла
 * @return {} массив модулей с информацией оборудования + значение выхода (массив) для групповой записи выходов
 */
function convCmd(obj) {
	const { data, value, output, retain } = obj;
	const cmd = store.command;
	// Все модули с информацией по оборудованию
	const m = data?.module.map((el) => ({
		...el,
		...data?.equipment[el.equipmentId],
	}));
	// Маска выходов DO
	const out = {};

	for (const key in value?.outputM) {
		if (key == 'null') continue;
		if (!value?.outputM?.[key]) {
			const o = aFind(m, key);
			out[key] = Array(o?.wr?.channel).fill(0);
			continue;
		}
		out[key] = value?.outputM?.[key]?.map((el) => {
			return el || 0;
		});
	}
	// Команды управления
	if (cmd)
		// по складам
		for (const build in cmd) {
			// по модулям склада
			for (const mdl in cmd?.[build]) {
				// по каналу модуля
				for (const channel in cmd?.[build]?.[mdl]) {
					out[mdl] ??= [];
					out[mdl][+channel] = cmd?.[build]?.[mdl]?.[channel];
				}
			}
		}
	//TODO  console.log('\x1b[32m%s\x1b[0m', 'Выхода: ', JSON.stringify(out))

	// Команды управления с таймером
	tracking(out, retain);

	// Очистка стека команд управления (импульсное управление)
	setCmd(null);

	// Формирование данных на запись в модули Output
	for (const o of m) {
		if (out[o._id]) output[o._id] = { ...o, value: out[o._id] };
	}
}

module.exports = convCmd;
