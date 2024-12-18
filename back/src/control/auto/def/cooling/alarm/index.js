const { msg } = require('@tool/message')

function alarm(s, se, seB, building, section, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd } = seB
	return [
		// Абсолютная влажность улицы ниже допустимой при охлаждении
		{
			set: hAbsOut < hAbsIn - s.mois.differenceMax,
			reset: hAbsOut - s.mois.hysteresisAbs > hAbsIn - s.mois.differenceMax,
			msg: msg(building, section, 7),
		},
		// Абсолютная влажность улицы выше допустимой при охлаждении
		{
			set: hAbsOut > hAbsIn - s.mois.differenceMin,
			reset: hAbsOut + s.mois.hysteresisAbs < hAbsIn - s.mois.differenceMin,
			msg: msg(building, section, 8),
		},
		// Влажность улицы ниже допустимой при охлаждении
		{
			set: hout < s.mois.outMin,
			reset: hout - s.mois.hysteresisRel > s.mois.outMin,
			msg: msg(building, section, 9),
		},
		// Влажность улицы выше допустимой при охлаждении
		{
			set: hout > s.mois.outMax,
			reset: hout + s.mois.hysteresisRel < s.mois.outMax,
			msg: msg(building, section, 10),
		},
		// Температура улицы выше допустимой для охлаждения
		{
			set: tout >= tprd - s.cooling.differenceMin,
			reset: tout + s.cooling.hysteresisOut < tprd - s.cooling.differenceMin,
			msg: msg(building, section, 11),
		},
		// Температура улицы ниже допустимой для охлаждения
		{
			set: tout <= tprd - s.cooling.differenceMax,
			reset: tout - s.cooling.hysteresisOut > tprd - s.cooling.differenceMax,
			msg: msg(building, section, 16),
		},
		{
			set: tout <= s.cooling.minOut,
			reset: tout - s.cooling.hysteresisOut > s.cooling.minOut,
			msg: msg(building, section, 12),
		},
	]
}

module.exports = alarm
