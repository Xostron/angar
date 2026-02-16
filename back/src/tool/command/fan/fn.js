const { isExtralrm } = require('@tool/message/extralrm');
const { setACmd } = require('@tool/command/set');
const { isСoolerCombiVNO, isCoolerCombiOn } = require('@tool/combi/is');

/**
 * Команда авторежима на плавный пуск/стоп ВНО секции
 * @param {*} bld Id склада
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 * @param {*} start команда авторежим: пуск/стоп ВНО секции
 */
function fnACmd(bld, resultFan, obj, bdata) {
	const start = resultFan.start.includes(true);
	if (!bdata?.s) return;
	const idB = bld._id;
	const delay = bdata.s.fan.delay * 1000;
	// const localB = isExtralrm(idB, null, 'local');
	// const coolerCombiOn = isCoolerCombiOn(bld, bdata);
	resultFan.list.forEach((idS) => {
		// Включение ВНО с проверкой:
		// Секция в авто
		// const sectOn = obj?.retain?.[idB]?.mode?.[idS];
		// Нет переключателя на щите
		// const local = isExtralrm(idB, idS, 'local');
		// Комби-холод: если ВНО испарителей выключены, то блокировать ВНО секций
		// const ccVNO = isСoolerCombiVNO(bld, idS, obj, bdata);
		// object.data.coller рама испарителей по idBld back\src\tool\cooler\index.js для получения испарителей по складу
		// TODO добавить проверку на оттайку object.value.[id_coller].state
		const a = [
			[isExtralrm(idB, idS, 'local'), 'Нет переключателя на щите'],
			[isExtralrm(idB, null, 'local'), 'местный режим блокировки'],
			[!obj?.retain?.[idB]?.mode?.[idS], 'секция не в авто'],
			[!isCoolerCombiOn(bld, bdata), 'комби-холод: испарители выключены'],
			[!isСoolerCombiVNO(bld, idS, obj, bdata), ' Комби-холод: если ВНО испарителей выключены, то блокировать ВНО секций'],
		];
		if (a.filter((el) => el[0]).length > 0) {
			// if (local || localB || !sectOn || !coolerCombiOn || !ccVNO) {
			// console.log(
			// 	11,
			// 	'Секция',
			// 	idS,
			// 	'Плавный пуск: ВНО выключены из-за:',
			// 	local,
			// 	localB,
			// 	!sectOn,
			// 	!coolerCombiOn,
			// 	!ccVNO
			// );
			console.log(
				11,
				'Секция',
				idS,
				'Плавный пуск: ВНО выключены из-за:',
				a.filter((el) => el[0])
			);
			setACmd('fan', idS, { delay, type: 'off', force: null, max: null });
			return;
		}

		// Принудительное включение ВНО: удаление СО2, внутренняя вентиляция
		if (resultFan.force.includes(true)) {
			rfs = getRFstg(resultFan.stg);
			// console.log(115, resultFan.stg, rfs, bdata?.s?.[rfs]?.max)
			setACmd('fan', idS, {
				delay,
				type: 'on',
				force: true, // принудительное включение
				max: bdata?.s?.[rfs]?.max, // max кол-во ВНО при принудительном включении
			});
			return;
		}

		// Если нет блокировок и нет принудительного, то включаем по состоянию start
		setACmd('fan', idS, {
			delay,
			type: start ? 'on' : 'off',
			force: null,
			max: null,
		});
	});
}

/**
 * Прогрев клапанов
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 */
// Задержка включения ВНО при прогреве клапанов
const delay = 3;
function fnFanWarm(resultFan, s) {
	const group = Object.values(resultFan.warming);
	for (const o of group) {
		setACmd('fan', o.sectionId, { delay, type: 'on', warming: true });
	}
}

// Получить настройку stg
function getRFstg(stg = []) {
	if (!stg.length) return null;
	// все элементы null
	if (stg.every((el) => el === null)) return null;
	// Если имеется хотя бы один элемент 'со2'
	if (stg.some((el) => el === 'co2')) return 'co2';
	// если имеется хотя бы один элемент 'coolerCombi'
	if (stg.some((el) => el === 'coolerCombi')) return 'coolerCombi';
	return 'vent';
}

module.exports = { fnACmd, fnFanWarm, getRFstg };
