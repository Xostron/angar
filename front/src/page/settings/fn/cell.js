// Ячейки строки
export default function fnCell(code, result, mark, idB, setSettingAu) {
	mark.list.forEach((ml) => {
		const obj = { build: idB, type: code, name: mark._code + '.' + ml._code }
		const setValue = (value) => setSettingAu({ value, ...obj })
		switch (ml.type) {
			case 'number':
				// Редактируемое поле
				result.push({
					field: 'input',
					code: mark._code + '.' + ml._code,
					type: 'number',
					step: 0.1,
					min: ml.min,
					max: ml.max,
					_acv: ml._acv ?? false,
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
					code: mark._code + '.' + ml._code,
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
					code: mark._code + '.' + ml._code,
					type: 'time',
					setValue,
					factory: ml.value ?? '',
				})
				if (mark.list.length === 1) result.push({ field: 'text', value: ml.value })
				break
			case 'choice':
				result.push({
					field: 'popup',
					code: mark._code + '.' + ml._code,
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
			default:
				break
		}
	})
}
