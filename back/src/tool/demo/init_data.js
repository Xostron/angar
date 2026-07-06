const data = {
	// текущая стадия
	cur: null,
	// Стадии: [сушка drying, хранение-охлаждение cooling, хранение-лечение cure, хранение-нагрев heat]
	stage: [
		{
			//
			name: 'Сушка',
			// Точка запуска стадии
			begin: null,
			// Продолжительность стадии
			time: null,
			// Температура продукта: 
			// Стартовое (a), конечное (b),
			// шаг изменения от a до b (k), текущее значение (v)
			tprd: { a: 0, b: 0, k: 0, v: null },
			tcnl: { a: 0, b: 0, k: 0, v: null },
			hin: { a: 0, b: 0, k: 0, v: null },
			p: { a: 0, b: 0, k: 0, v: null },
			tout: { a: 0, b: 0, k: 0, v: null },
			hout: { a: 0, b: 0, k: 0, v: null },
			tin: { a: 0, b: 0, k: 0, v: null },
		},
		{
			name: 'Охлаждение',
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
