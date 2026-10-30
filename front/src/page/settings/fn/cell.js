// Ячейки строки
export default function fnCell(code, result, mark, idB, setSettingAu, stgV) {
	mark.list.forEach((ml) => {
		// console.log(11, stgV)
		const _code = mark._code + '.' + ml._code
		const obj = { build: idB, type: code, _code }
		const setValue = (value) => setSettingAu({ value, ...obj })
		// Пользовательская настройка
		const value = stgV.getValueSetting(_code.split('.'), stgV.build, stgV.type, stgV.prd)
		if (_code=='drying.begin') console.log()
		// if (ml._code === 'more') console.log(111, value, _code.split('.'))

		switch (ml.type) {
			case 'number':
				// Редактируемое поле
				result.push({
					field: 'input',
					code: _code,
					type: 'number',
					step: 0.1,
					min: ml.min,
					max: ml.max,
					_acv: ml._acv ?? false,
					value,
					setValue,
					factory: ml.value ?? '',
				})
				// Заводская настройка (Если одна колонка markList)
				if (mark.list.length === 1) result.push({ field: 'text', value: ml.value })
				// Единица измерения
				if (mark.list.length === 1 && ml.unit)
					result.push({ field: 'text', value: ml.unit })
				break
			case 'boolean':
				// Редактируемое поле
				result.push({
					field: 'switch',
					code: _code,
					value,
					setValue,
					factory: ml.value ?? '',
				})
				// Заводская настройка (Если одна колонка markList)
				if (mark.list.length === 1)
					result.push({ field: 'text', value: ml.value ? 'Вкл' : 'Выкл' })
				break
			case 'time':
				result.push({
					field: 'input',
					code: _code,
					type: 'time',
					value,
					setValue,
					factory: ml.value ?? '',
				})
				if (mark.list.length === 1) result.push({ field: 'text', value: ml.value })
				break
			case 'choice':
				result.push({
					field: 'popup',
					code: _code,
					value,
					list: ml?.list?.map((el) => ({ title: el.name, code: el.value })),
					default: 'Выкл',
					setValue,
					factory: ml.value?.[1] ?? '',
				})
				if (mark.list.length === 1) result.push({ field: 'text', value: ml.value?.[0] })
				break
			case 'txt':
				result.push({ field: 'head', value: ml._name })
				break
			case 'more':
				const o = fnMore(mark, ml, obj)
				// console.log(11, o)
				result.push({ field: 'more', value: ml._name, mark, obj, setSettingAu })
				break
			default:
				break
		}
	})
}

function fnMore(mark, ml, obj) {
	const r = {}
	// console.log(22, mark)
	return r
}
