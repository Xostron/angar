const onTime = require('../on_time');
const { data: store, wrAchieve, delAchieve } = require('@store')
const { msgB } = require('@tool/message')
const mes = require('@dict/message')

// Проверка включения выход/охлаждение/обдув/набор холода
function check(fnChange, code, acc, se, s, bld) {
	console.log('delta', s.cold.deltaRoom, s.cooler.deltaCold)
	onTime(code, acc);
	console.log('\nПроверка условий принятия решений');
	// Выключение (Температура задания достигнута)
	if (se.cooler.tprd <= acc.target) {
		wrAchieve(bld._id, bld.type, msgB(bld, 80, `${acc.target} °C`));
		delAchieve(bld._id, bld.type, mes[81].code);
		if (code === 'off') return;
		console.log(
			code,
			`Выключение - тмп. продукта ${se.cooler.tprd}<=${acc.target} тмп. задания`
		);
		return fnChange(0, 0, 0, 0, 'off');
	} else {
		delAchieve(bld._id, bld.type, mes[80].code);
		const txt = `Температура задания ${acc.target} °C, продукта ${se.cooler.tprd} °C`;
		wrAchieve(bld._id, bld.type, msgB(bld, 81, txt));
	}

	let sol = ['frost', 'cooling'].includes(code) ? 1 : 0; //Соленоид
	let ven = ['cooling', 'blow'].includes(code) ? 1 : 0; //Вентилятор

	console.log(
		'Условие',
		1,
		`Соленоид 1. Тмп. помещения ${se.tin} > ${
			s.cold.room + s.cold.deltaRoom
		} Целевая тмп. помещения + deltaR(${s.cold.deltaRoom}), r =`,
		se.tin > s.cold.room + s.cold.deltaRoom
	);
	console.log(
		'Условие',
		2,
		`Соленоид 0, Тмп. помещения ${se.tin} =< ${s.cold.room} Целевая тмп. помещения, r =`,
		se.tin <= s.cold.room
	);
	console.log(
		'Условие',
		3,
		`Вентилятор 1. Тмп. дт. всасывания ${se.cooler.clr} < ${s.cooler.cold} Целевой тмп. дт.`,
		se.cooler.clr <= s.cooler.cold
	);
	console.log(
		'Условие',
		4,
		`Вентилятор 0. Тмп. дт. всасывания ${se.cooler.clr} > ${
			s.cooler.cold + s.cooler.deltaCold
		} Целевой тмп. дт. + delta(${s.cooler.deltaCold})`,
		se.cooler.clr > s.cooler.cold + s.cooler.deltaCold
	);

	// условия включения солененоида
	if (se.tin > s.cold.room + s.cold.deltaRoom) sol = 1;
	if (se.tin <= s.cold.room) sol = 0;

	// Условия включения вентилятора
	if (se.cooler.clr <= s.cooler.cold) ven = 1;
	if (se.cooler.clr > s.cooler.cold + s.cooler.deltaCold) ven = 0;
	// console.log(sol, ven);
	// console.log('(!sol && !ven )||(sol && !ven)', (!sol && !ven ), (sol && !ven), (!sol && !ven )||(sol && !ven));
	// console.log('!sol && ven', !sol && ven);

	if ((!sol && !ven) || (sol && !ven)) {
		if (code === 'frost') return;
		return fnChange(1, 0, 0, 0, 'frost');
	} else if (!sol && ven) {
		if (code === 'blow') return;
		acc.state.frost = new Date()
		return fnChange(0, 1, 0, 0, 'blow');
	} else {
		if (code === 'cooling') return;
		return fnChange(1, 1, 0, 0, 'cooling');
	}
}

module.exports = check;
