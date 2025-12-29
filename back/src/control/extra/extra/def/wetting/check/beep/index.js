const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm');
const { arrCtrlDO } = require('@tool/command/module_output');
const { msg } = require('@tool/message');

const beepMsg = {
	off: 'Потеря питания',
	pressure: 'Не исправна станции высокого давления',
	control: 'Ошибка Управления',
	water: 'Нет воды',
	// не авария
	heating: 'Ошибка подогрева воды',
};

// Обработка аварий по каждому увлажнителю
function beep(wettings, value, bld, sect) {
	const bldId = bld._id;
	const secId = sect._id;
	const arr = wettings.filter((el) => {
		if (value[el._id].state !== 'alarm') return el;
		// Аварии сигналов увлажнителя
		const a = [];
		const beep = value[el._id]?.beep;
		Object.keys(beep)?.forEach((key) => {
			if (beep[key].value && beep[key].alarm) a.push(beepMsg[key]);
		});

		if (a.length) {
			const s = `${el.device.name} ${el.order}: ${a.join(', ')}`;
			console.log(
				'wrExtralrm',
				bldId,
				secId,
				el._id,
				msg(bld, sect, 160, s)
			);
			wrExtralrm(bldId, 'wetting', el._id, msg(bld, sect, 160, s));
			// выключаем увлажнитель
			arrCtrlDO(bldId, [el], 'off');
		} else {
			console.log('\n\n\n\ndelExtralrm', bldId, sect, el._i);
			delExtralrm(bldId,  'wetting', el._id);
		}

		return false;
	});
	return arr;
}

module.exports = beep;
