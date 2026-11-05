// Ячейки строки
export default function fnCell(code, result, mark, idB, setSettingAu, sendSettingAu, stgV) {
	const moreValue = { begin: [], end: [] }
	mark.list.forEach((ml) => {
		const _code = mark._code + '.' + ml._code
		const obj = { build: idB, type: code, _code }
		const setValue = (value, idx, arrV) => setSettingAu({ value, ...obj, idx, arrV })
		// Пользовательская настройка ?? заводская ?? пустая строка
		const factory = code == 'idle' || code == 'idleCold' ? [ml?.value ?? ''] : (ml?.value ?? '')
		// console.log(123, obj)
		const value = stgV.getValueSetting(
			_code.split('.'),
			stgV.build,
			stgV.type,
			stgV.prd,
			factory,
		)
		// ====================================
		// if (_code == 'cooler.begin') console.log(22, value)

		pickMore(code, ml, moreValue, value)

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
					// value: value instanceof Array ? value[0] : value,
					value,
					setValue,
					factory,
					// idx:,
					// arrV:
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
					factory,
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
					value: value instanceof Array ? value[0] : value,
					setValue,
					factory,
					...pickBE(code, value),
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
					factory,
				})
				if (mark.list.length === 1) result.push({ field: 'text', value: ml.value?.[0] })
				break
			case 'txt':
				result.push({ field: 'head', value: ml._name })
				break
			case 'more':
				const o = fnMore(mark, ml, obj, moreValue, setSettingAu, sendSettingAu)
				result.push({ field: 'more', ...o })
				break
			default:
				break
		}
	})
	return result
}

// Только для "Таймер запрет", данные необходимые для сохранения на первой странице
function pickBE(code, value) {
	if (code != 'idle' && code != 'idleCold') return {}
	return { idx: 0, arrV: value }
}

// Только для "Таймер запрет", данные необходимые для сохранения на модалке
function fnMore(mark, ml, obj, moreValue, setSettingAu, sendSettingAu) {
	const len = moreValue?.begin?.length ?? ''
	const r = {
		// Значение кнопки (имя)
		value: `${ml._name} ` + len,
		// Имя шапки
		title: mark._name,
		// Столбцы
		column: ['Начало', 'Окончание', ''],
		// Значения полей - массив
		moreValue,
		// Изменить значения настройки
		setSettingAu,
		// Записать изменения на сервере
		sendSettingAu,
		// Стандартный объект для изменения настройки
		obj,
		// Код строки настройки
		markCode: mark._code,
	}
	// console.log(22, r)
	return r
}

// Только для "Таймер запрет", собираем значения поля begin, end
function pickMore(code, ml, moreValue, value) {
	if (!['idle', 'idleCold'].includes(code)) return
	moreValue[ml._code] = value
}
