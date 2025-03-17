const { msg } = require('@tool/message')

function alarm(s, seB, building, section) {
	const { tout, hout, hAbsOut, hAbsIn } = seB
	// console.log(
	// 	1111,
	// 	'set',
	// 	'roma',
	// 	hAbsOut >= hAbsIn - s.mois.differenceMin,
	// 	hAbsOut,
	// 	'====',
	// 	hAbsIn,
	// 	s.mois.differenceMin
	// )
	// console.log(
	// 	2222,
	// 	'reset',
	// 	'roma',
	// 	hAbsOut + s.mois.hysteresisAbs < hAbsIn - s.mois.differenceMin,
	// 	hAbsOut,
	// 	s.mois.hysteresisAbs,
	// 	'====',
	// 	hAbsIn,
	// 	s.mois.differenceMin
	// )

	// console.log(
	// 	2222,
	// 	'set: ',
	// 	hAbsOut < hAbsIn - s.mois.differenceMax,
	// 	'reset: ',
	// 	hAbsOut - s.mois.hysteresisAbs > hAbsIn - s.mois.differenceMax,
	// 	hAbsOut,
	// 	s.mois.hysteresisAbs,
	// 	hAbsIn - s.mois.differenceMax
	// )
	// console.log(3333, s.drying.channelMax, tout, 'set', s.drying.channelMax < tout, 'reset', s.drying.channelMax > tout + s.drying.hysteresisOut)
	return [
		{
			set: s.drying.channelMax < tout,
			reset: s.drying.channelMax > tout + s.drying.hysteresisOut,
			msg: msg(building, section, 1),
		},
		{
			set: tout < s.drying.min,
			reset: tout - s.drying.hysteresisOut > s.drying.min,
			msg: msg(building, section, 2),
		},
		{
			set: hout < s.drying.humidityMin,
			reset: hout - s.mois.hysteresisRel > s.drying.humidityMin,
			msg: msg(building, section, 3),
		},
		{
			set: hout > s.drying.humidityMax,
			reset: hout + s.mois.hysteresisRel < s.drying.humidityMax,
			msg: msg(building, section, 4),
		},
		{
			set: hAbsOut < hAbsIn - s.mois.differenceMax,
			reset: hAbsOut - s.mois.hysteresisAbs > hAbsIn - s.mois.differenceMax,
			msg: msg(building, section, 5),
		},
		{
			set: hAbsOut >= hAbsIn - s.mois.differenceMin,
			reset: hAbsOut + s.mois.hysteresisAbs < hAbsIn - s.mois.differenceMin,
			msg: msg(building, section, 6),
		},
	]
}

module.exports = alarm
