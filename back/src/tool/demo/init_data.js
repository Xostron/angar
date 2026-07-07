const data = {
	first:null,
	// текущая стадия
	cur: null,
	// Стадии: [сушка drying, хранение-охлаждение cooling, хранение-лечение cure, хранение-нагрев heat]
	stage: [
		{
			//
			name: 'Сушка',
			automode:'drying',
			// Точка запуска стадии
			begin: null,
			// Продолжительность стадии
			time: null,
			// Температура продукта: 
			// a - Стартовое значение, b - конечное,
			// k - шаг изменения от a до b, v - текущее значение
			tprd: { a: 5, b: 10, k: 0, v: null },
			tcnl: { a: 15, b: 10, k: 0, v: null },
			hin: { a: 80, b: 0, k: 0, v: null },
			p: { a: 0, b: 0, k: 0, v: null },
			tout: { a: 0, b: 5, k: 0, v: null },
			hout: { a: 70, b: 75, k: 0, v: null },
			tin: { a: 5, b: 15, k: 0, v: null },
		},
		{
			name: 'Охлаждение',
			automode:'cooling',
			time: null,
			tprd: { a: 0, b: 0, k: 0, v: null },
			tcnl: { a: 0, b: 0, k: 0, v: null },
			hin: { a: 0, b: 0, k: 0, v: null },
			p: { a: 0, b: 0, k: 0, v: null },
			tout: { a: 0, b: 0, k: 0, v: null },
			hout: { a: 0, b: 0, k: 0, v: null },
			tin: { a: 0, b: 0, k: 0, v: null },
		},
		{
			name: 'Лечение',
			automode:'cooling',
			time: null,
			tprd: { a: 0, b: 0, k: 0, v: null },
			tcnl: { a: 0, b: 0, k: 0, v: null },
			hin: { a: 0, b: 0, k: 0, v: null },
			p: { a: 0, b: 0, k: 0, v: null },
			tout: { a: 0, b: 0, k: 0, v: null },
			hout: { a: 0, b: 0, k: 0, v: null },
			tin: { a: 0, b: 0, k: 0, v: null },
		},
		{
			name: 'Нагрев',
			automode:'cooling',
			time: null,
			tprd: { a: 0, b: 0, k: 0, v: null },
			tcnl: { a: 0, b: 0, k: 0, v: null },
			hin: { a: 0, b: 0, k: 0, v: null },
			p: { a: 0, b: 0, k: 0, v: null },
			tout: { a: 0, b: 0, k: 0, v: null },
			hout: { a: 0, b: 0, k: 0, v: null },
			tin: { a: 0, b: 0, k: 0, v: null },
		},
	],
}

module.exports = JSON.stringify(data)
