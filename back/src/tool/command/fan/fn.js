const { isExtralrm } = require('@tool/message/extralrm');
const { setACmd } = require('@tool/command/set');
const { isСoolerCombiVNO, isCoolerCombiOn } = require('@tool/combi/is');
const { getStateClr } = require('@tool/cooler')

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
	resultFan.list.forEach((idS) => {
		console.log(110, "fnACmd: Секция=", idS)
		const st = getStateClr(idS,obj)
		const a = [
			[isExtralrm(idB, idS, 'local'), 'Нет переключателя на щите'],
			[isExtralrm(idB, null, 'local'), 'местный режим блокировки'],
			[!obj?.retain?.[idB]?.mode?.[idS], 'секция не в авто'],
			[!isCoolerCombiOn(bld, bdata), 'комби-холод: испарители выключены'],
			[!isСoolerCombiVNO(bld, idS, obj, bdata), ' Комби-холод: если ВНО испарителей выключены, то блокировать ВНО секций'],
			[st.includes('off-off-on') || st.includes('off-off-off-add'),'Включена оттайка или слив воды']
		];
		if (a.filter((el) => el[0]).length > 0) {
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
