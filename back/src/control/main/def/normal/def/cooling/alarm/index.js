const { msgB } = require('@tool/message')
const { data: store } = require('@store')

function alarm(s, seB, building, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd } = seB
	//
	const r = [
		// Абсолютная влажность улицы ниже допустимой при охлаждении
		{
			set: hAbsOut < hAbsIn - acc?.setting?.mois?.differenceMax,
			reset: hAbsOut - acc?.setting?.mois?.abs?.h > hAbsIn - acc?.setting?.mois?.differenceMax,
			msg: msgB(building, 7),
		},
		// Абсолютная влажность улицы выше допустимой при охлаждении
		{
			set: hAbsOut > hAbsIn - acc?.setting?.mois?.differenceMin,
			reset: hAbsOut + acc?.setting?.mois?.abs?.h < hAbsIn - acc?.setting?.mois?.differenceMin,
			msg: msgB(building, 8),
		},
		// Влажность улицы ниже допустимой при охлаждении
		{
			set: hout < acc?.setting?.mois?.outMin,
			reset: hout - acc?.setting?.mois?.hysteresisRel > acc?.setting?.mois?.outMin,
			msg: msgB(building, 9),
		},
		// Влажность улицы выше допустимой при охлаждении
		{
			set: hout > acc?.setting?.mois?.outMax,
			reset: hout + acc?.setting?.mois?.hysteresisRel < acc?.setting?.mois?.outMax,
			msg: msgB(building, 10),
		},
		// Температура улицы выше допустимой для охлаждения
		{
			set: tout >= tprd - acc?.setting?.cooling?.differenceMin,
			reset: tout + acc?.setting?.cooling?.hysteresisOut < tprd - acc?.setting?.cooling?.differenceMin,
			msg: msgB(building, 11),
		},
		// Температура улицы ниже допустимой для охлаждения
		{
			set: tout <= tprd - acc?.setting?.cooling?.differenceMax,
			reset: tout - acc?.setting?.cooling?.hysteresisOut > tprd - acc?.setting?.cooling?.differenceMax,
			msg: msgB(building, 16),
		},
		{
			set: tout <= acc?.setting?.cooling?.minOut,
			reset: tout - acc?.setting?.cooling?.hysteresisOut > acc?.setting?.cooling?.minOut,
			msg: msgB(building, 12),
		},
	]
	// console.log(
	// 	444,
	// 	r.map(({ set, reset }) => ({ set, reset }))
	// )
	// console.log(
	// 	4441,
	// 	hAbsOut + acc?.setting?.mois?.abs?.h < hAbsIn - acc?.setting?.mois?.differenceMin,
	// 	hAbsOut + acc?.setting?.mois?.abs?.h,
	// 	'<',
	// 	hAbsIn - acc?.setting?.mois?.differenceMin,
	// 	'===',
	// 	hAbsOut,
	// 	acc?.setting?.mois?.abs?.h,
	// 	hAbsIn,
	// 	acc?.setting?.mois?.differenceMin
	// )
	return r
}

module.exports = alarm
