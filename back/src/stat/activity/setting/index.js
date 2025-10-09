module.exports = (code, obj, oData) => {
	const { title } = web(code, obj, oData) ?? mobile(code, obj, oData) ?? {}
	return {
		type: 'setting',
		title,
	}
}

function web(code, obj, oData) {
	if (code != 's_setting_au') return
	const { factory } = oData
	stgCode = obj.code
	prdCode = obj.prdCode
	nameStg = factory?.[stgCode]?._name
	namePrd = factory?.[stgCode]?.[prdCode]?._name
	let title = []
	// По линии
	for (const line in obj.value) {
		const lineName = factory?.[stgCode]?.[prdCode]?.[line]?._name
		// По полю (mark)
		let t = ``
		for (const fld in obj.value[line]) {
			const fldVal = obj.value[line][fld]
			const fldName =
				line === fld ? '' : `(${factory?.[stgCode]?.[prdCode]?.[line]?.[fld]?._name}) `
			if (!t) t += `${fldName}= ${fldVal}`
			else t += `; ${fldName}= ${fldVal}`
		}
		title.push(`${lineName} ${t}`)
	}
	return {
		title:
			`Изменение настройки "${nameStg}", продукт "${namePrd}": ` +
			(title.length > 1 ? title.join('; ') : title.join('')),
	}
}

function mobile(code, obj, oData) {
	if (code != 'setting') return
	const { factory } = oData
	stgCode = obj.code
	prdCode = obj.product
	nameStg = factory?.[stgCode]?._name
	namePrd = factory?.[stgCode]?.[prdCode]?._name
	let title = []
	// По линии
	for (const line in obj.val) {
		const lineName =
			factory?.[stgCode]?.[prdCode]?.[line]?._name ?? factory?.[stgCode]?.[line]?._name
		// По полю (mark)
		let t = ``
		for (const fld in obj.val[line]) {
			const fldVal = obj.val[line][fld]
			const fldName =
				line === fld ? '' : `(${factory?.[stgCode]?.[prdCode]?.[line]?.[fld]?._name}) `
			if (!t) t += `${fldName}= ${fldVal}`
			else t += `; ${fldName}= ${fldVal}`
		}
		title.push(`${lineName} ${t}`)
	}
	return {
		title:
			`Изменение настройки "${nameStg}", продукт "${namePrd}": ` +
			(title.length > 1 ? title.join('; ') : title.join('')),
	}
}
