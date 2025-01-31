const { msg } = require('@tool/message')
const { data: store } = require('@store')

function alarm(s, se, seB, building, section, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd } = seB
	// console.log(222, acc.setting)
	if (!Object.keys(acc.setting??{}).length) return null
	return [
		// Абсолютная влажность улицы ниже допустимой при охлаждении
		{
			set: hAbsOut < hAbsIn - acc.setting.mois.differenceMax,
			reset: hAbsOut - acc.setting.mois.hysteresisAbs > hAbsIn - acc.setting.mois.differenceMax,
			msg: msg(building, section, 7),
		},
		// Абсолютная влажность улицы выше допустимой при охлаждении
		{
			set: hAbsOut > hAbsIn - acc.setting.mois.differenceMin,
			reset: hAbsOut + acc.setting.mois.hysteresisAbs < hAbsIn - acc.setting.mois.differenceMin,
			msg: msg(building, section, 8),
		},
		// Влажность улицы ниже допустимой при охлаждении
		{
			set: hout < acc.setting.mois.outMin,
			reset: hout - acc.setting.mois.hysteresisRel > acc.setting.mois.outMin,
			msg: msg(building, section, 9),
		},
		// Влажность улицы выше допустимой при охлаждении
		{
			set: hout > acc.setting.mois.outMax,
			reset: hout + acc.setting.mois.hysteresisRel < acc.setting.mois.outMax,
			msg: msg(building, section, 10),
		},
		// Температура улицы выше допустимой для охлаждения
		{
			set: tout >= tprd - acc.setting.cooling.differenceMin,
			reset: tout + acc.setting.cooling.hysteresisOut < tprd - acc.setting.cooling.differenceMin,
			msg: msg(building, section, 11),
		},
		// Температура улицы ниже допустимой для охлаждения
		{
			set: tout <= tprd - acc.setting.cooling.differenceMax,
			reset: tout - acc.setting.cooling.hysteresisOut > tprd - acc.setting.cooling.differenceMax,
			msg: msg(building, section, 16),
		},
		{
			set: tout <= acc.setting.cooling.minOut,
			reset: tout - acc.setting.cooling.hysteresisOut > acc.setting.cooling.minOut,
			msg: msg(building, section, 12),
		},
	]
}

module.exports = alarm
