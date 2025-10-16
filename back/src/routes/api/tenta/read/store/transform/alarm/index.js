const { data: store } = require('@store')

function alarm(idB, idS, data) {
	// Таймеры запретов
	const timer = Object.values(data?.alarm?.timer?.[idB] ?? {}).map((el) => ({
		code: el?.type,
		msg: el?.msg,
	}))
	// Аварии секции
	if (idS) {
		// Аварии авторежима секции
		// console.log(222,data?.alarm?.bar?.[idB]?.[idS], Object.keys(data?.alarm?.bar?.[idB]?.[idS] ?? {}))
		const a = Object.keys(data?.alarm?.bar?.[idB]?.[idS] ?? {})
			.map((code) => {
				let alr = data?.alarm?.bar?.[idB]?.[idS]?.[code]?.[0]
				if (['antibliz', 'alrClosed'].includes(code))
					alr = data?.alarm?.bar?.[idB]?.[idS]?.[code]
				return alr ? { code, msg: alr?.msg } : null
			})
			.filter((el) => !!el)
		a.push(...timer)
		return a
	}
	const a = Object.keys(data?.alarm?.barB?.[idB] ?? {})
		.map((k) => {
			const alr = data?.alarm?.barB?.[idB]?.[k]?.[0]
			return alr ? { code: k, msg: alr?.msg } : null
		})
		.filter((el) => !!el)

	// let notTune = data?.alarm?.banner?.notTune[idB]
	let notTune = store.alarm?.extralrm?.[idB]?.notTune
	notTune = { code: notTune.code, msg: notTune.msg, date: notTune.date }
	// console.log(1, '**************', notTune)
	a.push(notTune)
	a.push(...timer)
	return a
}

module.exports = alarm
