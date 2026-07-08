const data = {
	first: null,
	// текущая стадия
	cur: null,
	// Стадии: [сушка drying, хранение-охлаждение cooling, хранение-лечение cure, хранение-нагрев heat]
	stage: [
		{
			//
			name: 'Сушка',
			automode: 'drying',
			// Точка запуска стадии
			begin: null,
			// Точки отсчета изменения величины от а к b[0], от b[0] к b[1]
			begin2: [null, null],
			// Продолжительность стадии
			time: null,
			i: null,
			// Температура продукта:
			// a - Стартовое значение, b - конечное,
			// k - шаг изменения от a до b, v - текущее значение
			tprd: { a: 20, b: [30, 25], k: 0, v: null },
			tcnl: { a: 15.7, b: [35.7, 15.7], k: 0, v: null },
			hin: { a: 50, b: [90, 75], k: 0, v: null },
			// p: { a: 0, b: 0, k: 0, v: null },
			tout: { a: 15, b: [35, 15], k: 0, v: null },
			hout: { a: 70, b: [97, 60], k: 0, v: null },
			// tin: { a: 5, b: 15, k: 0, v: null },
		},
		{
			name: 'Охлаждение',
			automode: 'cooling',
			// Точка запуска стадии
			begin: null,
			begin2: [null, null],
			// Продолжительность стадии
			time: null,
			i: null,
			tprd: { a: 25, b: [1, 3], k: 0, v: null },
			tcnl: { a: 15.7, b: [1, 4], k: 0, v: null },
			hin: { a: 75, b: [92, 80], k: 0, v: null },
			// p: { a: 0, b: 0, k: 0, v: null },
			tout: { a: 15, b: [-25, 10], k: 0, v: null },
			hout: { a: 60, b: [97, 70], k: 0, v: null },
			// tin: { a: 0, b: 0, k: 0, v: null },
		},
		{
			name: 'Лечение',
			automode: 'cooling',
			// Точка запуска стадии
			begin: null,
			begin2: [null, null],
			// Продолжительность стадии
			time: null,
			i: null,
			tprd: { a: 0, b: [0, 0], k: 0, v: null },
			tcnl: { a: 0, b: [0, 0], k: 0, v: null },
			hin: { a: 0, b: [0, 0], k: 0, v: null },
			tout: { a: 0, b: [0, 0], k: 0, v: null },
			hout: { a: 0, b: [0, 0], k: 0, v: null },
		},
		{
			name: 'Нагрев',
			automode: 'cooling',
			// Точка запуска стадии
			begin: null,
			begin2: [null, null],
			// Продолжительность стадии
			time: null,
			i: null,
			tprd: { a: 0, b: [0, 0], k: 0, v: null },
			tcnl: { a: 0, b: [0, 0], k: 0, v: null },
			hin: { a: 0, b: [0, 0], k: 0, v: null },
			tout: { a: 0, b: [0, 0], k: 0, v: null },
			hout: { a: 0, b: [0, 0], k: 0, v: null },
		},
	],
}

module.exports = JSON.stringify(data)
