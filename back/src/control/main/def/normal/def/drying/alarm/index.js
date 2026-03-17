const { msgB } = require('@tool/message')

function drying(s, seB, building, acc, bdata) {
	const { tout, hout, hAbsOut, hAbsIn } = seB
	// Абсолютная влажность улицы выше допустимой при сушке
	// console.log(
	// 	99003,
	// 	'Абсолютная влажность улицы выше',
	// 	'set: ',
	// 	hAbsOut >= hAbsIn - s.mois.differenceMin,
	// 	'reset: ',
	// 	hAbsOut + s.mois.abs.h < hAbsIn - s.mois.differenceMin,
	// 	hAbsOut,
	// 	'+',
	// 	s.mois.abs.h,
	// 	'<',
	// 	hAbsIn,
	// 	'-',
	// 	s.mois.differenceMin
	// )
	// console.log(3333, s.drying.channelMax, tout, 'set', s.drying.channelMax < tout, 'reset', s.drying.channelMax > tout + s.drying.hysteresisOut)
	// console.log(
	// 	99003,
	// 	'Абсолютная влажность ниже',
	// 	'set',
	// 	hAbsOut >= hAbsIn - s.mois.differenceMin,
	// 	hAbsOut,
	// 	'>=',
	// 	hAbsIn,
	// 	'-',
	// 	s.mois.differenceMin,
	// 	'reset',
	// 	hAbsOut + s.mois.abs.h < hAbsIn - s.mois.differenceMin,
	// 	hAbsOut,
	// 	'+',
	// 	s.mois.abs.h,
	// 	'<',
	// 	hAbsIn,
	// 	'-',
	// 	s.mois.differenceMin
	// )
	// console.log(99004,'Абс влажн улицы выше', hAbsOut, hAbsIn , s.mois.differenceMin, hAbsIn - s.mois.differenceMin, hAbsOut >= hAbsIn - s.mois.differenceMin)
	return [
		// 1 Температура улицы не подходит при сушке
		{
			set: tout > s.drying.channelMax,
			reset: tout + s.drying.hysteresisOut < s.drying.channelMax,
			msg: msgB(building, 1),
		},
		// 2 Температура улицы ниже допустимой при сушке
		{
			set: tout < s.drying.min,
			reset: tout - s.drying.hysteresisOut > s.drying.min,
			msg: msgB(building, 2),
		},
		// 3 Влажность улицы ниже допустимой при сушке
		{
			set: hout < s.drying.humidityMin,
			reset: hout - s.mois.hysteresisRel > s.drying.humidityMin,
			msg: msgB(building, 3),
		},
		// 4 Влажность улицы выше допустимой при сушке
		{
			set: hout > s.drying.humidityMax,
			reset: hout + s.mois.hysteresisRel < s.drying.humidityMax,
			msg: msgB(building, 4),
		},
		// 5 Абсолютная влажность улицы ниже допустимой при сушке
		{
			set: hAbsOut < hAbsIn - s.mois.differenceMax,
			reset: hAbsOut - s.mois.abs?.h > hAbsIn - s.mois.differenceMax,
			msg: msgB(building, 5),
		},
		// 6 Абсолютная влажность улицы выше допустимой при сушке
		{
			set: hAbsOut >= hAbsIn - s.mois.differenceMin,
			reset: hAbsOut + s.mois.abs?.h < hAbsIn - s.mois.differenceMin,
			msg: msgB(building, 6),
		},
		// 7. Влажность улицы выше допустимой (точка росы)
		{
			set: seB.point + s.heat.point > seB.tprd,
			reset: seB.point + s.heat.point + s.heat.hysteresisP < seB.tprd,
			msg: msgB(building, 120),
		},
	]
}

module.exports = drying
