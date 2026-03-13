const { msgB } = require('@tool/message')
const { data: store } = require('@store')

function cooling(s, seB, building, acc, bdata) {
	const { tout, hout, hAbsOut, hAbsIn, tprd } = seB
	// console.log(124, 'alarm cooling')
	// В нагреве игнорируются аварии 0 1 4 6
	// В нагреве появляется новая авария "Влажность улицы выше допустимой (точка росы)"
	const r = [
		// 0 Абсолютная влажность улицы ниже допустимой при охлаждении // В нагреве игнор
		{
			set: hAbsOut < hAbsIn - acc?.setting?.mois?.differenceMax,
			reset:
				hAbsOut - acc?.setting?.mois?.abs?.h > hAbsIn - acc?.setting?.mois?.differenceMax,
			msg: msgB(building, 7),
		},
		// 1 Абсолютная влажность улицы выше допустимой при охлаждении // В нагреве игнор
		{
			set: hAbsOut > hAbsIn - acc?.setting?.mois?.differenceMin,
			reset:
				hAbsOut + acc?.setting?.mois?.abs?.h < hAbsIn - acc?.setting?.mois?.differenceMin,
			msg: msgB(building, 8),
		},
		// 2 Влажность улицы ниже допустимой при охлаждении
		{
			set: hout < acc?.setting?.mois?.outMin,
			reset: hout - acc?.setting?.mois?.hysteresisRel > acc?.setting?.mois?.outMin,
			msg: msgB(building, 9),
		},
		// 3 Влажность улицы выше допустимой при охлаждении
		{
			set: hout > acc?.setting?.mois?.outMax,
			reset: hout + acc?.setting?.mois?.hysteresisRel < acc?.setting?.mois?.outMax,
			msg: msgB(building, 10),
		},
		// 4 Температура улицы выше допустимой для охлаждения
		{
			set: tout >= tprd - acc?.setting?.cooling?.differenceMin,
			reset:
				tout + acc?.setting?.cooling?.hysteresisOut <
				tprd - acc?.setting?.cooling?.differenceMin,
			msg: msgB(building, 11),
		},
		// 5 Температура улицы ниже допустимой для охлаждения
		{
			set: tout <= tprd - acc?.setting?.cooling?.differenceMax,
			reset:
				tout - acc?.setting?.cooling?.hysteresisOut >
				tprd - acc?.setting?.cooling?.differenceMax,
			msg: msgB(building, 16),
		},
		// 6 В нагреве игнор
		{
			set: tout <= acc?.setting?.cooling?.minOut,
			reset: tout - acc?.setting?.cooling?.hysteresisOut > acc?.setting?.cooling?.minOut,
			msg: msgB(building, 12),
		},
		// 7. Влажность улицы выше допустимой (точка росы)
		{
			set: false,
			reset: true,
			msg: msgB(building, 120),
		},
	]
	// r.forEach((el) => console.log(123, el.set, el.reset))
	return r
}

module.exports = cooling
