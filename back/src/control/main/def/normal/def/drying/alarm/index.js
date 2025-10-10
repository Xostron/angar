const { msg } = require('@tool/message')

function alarm(s, seB, building, section) {
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
		// Температура улицы не подходит при сушке
		{
			set: s.drying.channelMax < tout,
			reset: s.drying.channelMax > tout + s.drying.hysteresisOut,
			msg: msg(building, section, 1),
		},
		// Температура улицы ниже допустимой при сушке
		{
			set: tout < s.drying.min,
			reset: tout - s.drying.hysteresisOut > s.drying.min,
			msg: msg(building, section, 2),
		},
		// Влажность улицы ниже допустимой при сушке
		{
			set: hout < s.drying.humidityMin,
			reset: hout - s.mois.hysteresisRel > s.drying.humidityMin,
			msg: msg(building, section, 3),
		},
		// Влажность улицы выше допустимой при сушке
		{
			set: hout > s.drying.humidityMax,
			reset: hout + s.mois.hysteresisRel < s.drying.humidityMax,
			msg: msg(building, section, 4),
		},
		// Абсолютная влажность улицы ниже допустимой при сушке
		{
			set: hAbsOut < hAbsIn - s.mois.differenceMax,
			reset: hAbsOut - s.mois.abs.h > hAbsIn - s.mois.differenceMax,
			msg: msg(building, section, 5),
		},
		// Абсолютная влажность улицы выше допустимой при сушке
		{
			set: hAbsOut >= hAbsIn - s.mois.differenceMin,
			reset: hAbsOut + s.mois.abs.h < hAbsIn - s.mois.differenceMin,
			msg: msg(building, section, 6),
		},
	]
}

module.exports = alarm
