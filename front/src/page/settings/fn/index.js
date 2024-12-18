import def from '../def/index'
import listVlv from '../def/tuneup/fn'




/**
 * 
 * @param {*} data 
 * @param {*} sum Количество настроек
 * @returns 
 */
function sty(data, sum) {
	const col = data.head.length
	const ll = data.list.length
	
	// Страница
	const st = {
		gridTemplateColumns: `var(--fsz180) repeat(${col + 1}, 1fr)  var(--fsz300)`,
		gridTemplateRows: `auto repeat(2, auto) auto`,
	}

	// Таблица
	const stl = {
		gridArea: `2/2/2/${col + 3}`,
		gridTemplateColumns: `1fr repeat(${col}, var(--fsz180))`,
		gridTemplateRows: `repeat(${ll},var(--fsz65))`,
	}

	// Заголовок
	const sth = { gridArea: `1/2/2/${col + 3}`, gridTemplateColumns: `auto repeat(${col}, var(--fsz180))` }

	// Боковая панель навигации
	const stn = {
		gridArea: `2/${col + 3}/3/${col + 4}`,
		gridTemplateColumns:'repeat(2, 1fr)',
		gridTemplateRows: `repeat(${~~(sum / 2 + 1)}, var(--fsz65))`,
	}
	return { st, stl, sth, stn }
}

/**
 * Формирование таблицы
 * @param {*} fct рама настроек
 * @param {*} code код настройки
 * @param {*} buildingId
 * @param {*} values
 * @param {*} setSettingAu
 * @param {*} sendSettingAu
 * @param {*} equipSect
 * @param {*} retainTune
 * @param {*} tune
 * @param {*} sendTune
 * @param {*} onSwitch
 * @param {*} prd
 * @returns
 */
function rack(fct, bldType, code, buildingId, setSettingAu, sendSettingAu, equipSect, retainTune, tune, sendTune, onSwitch, prd) {
	const data = { head: [], list: [] }
	// Калибровка клапанов
	if (code === 'tuneup' && bldType !== 'cold') {
		const d = def[code]
		d.list = listVlv(equipSect, retainTune, tune, onSwitch)
		d.warn = { ...d.warn, action: sendTune }
		return d
	}
	// Настройки из БД
	// Заголовок страницы
	data.title = {
		name: fct?._name,
		bName: code === 'tuneup' ? 'Запустить' : 'Сохранить',
	}

	// Строки с настройками
	data.list = fct?._prd ? setting(fct?.[prd?.code], code, buildingId, setSettingAu) : setting(fct?.list, code, buildingId, setSettingAu)
	// Максимальное кол-во ячеек в строке (для правильной css отрисовки)
	const max = Math.max(...data.list.map((el) => el?.length))

	// Заголовок таблицы настроек
	data.head = isFinite(max) ? Array(max - 1).fill(1) : ['']
	data.head[0] ? (data.head[0] = 'Значения') : {}
	data.head[1] ? (data.head[1] = 'Заводские') : {}
	data.head[2] ? (data.head[2] = 'Ед. измерения') : {}

	// Окно подтверждения warn
	data.warn = code === 'tuneup' ? { type: 'warn', title: `Калибровка клапанов`, text: `Начать калибровку?`, action: sendTune } : { type: 'warn', title: `${fct?._name}`, text: `Сохранить настройки?`, action: sendSettingAu }

	return data
}

// Форматирование строк
function setting(list, code, buildingId, setSettingAu) {
	if (!list) return []
	return list.map((el) => row(el, code, buildingId, setSettingAu))
}
// Формирование строки
function row(mark, code, buildingId, setSettingAu) {
	let result = []
	if (mark._type === 'txt') result = [{ field: 'title', icon: mark._icon ? `/img/settings/${code}/${mark._icon}.svg` : '', value: mark._name }]
	else result = [{ field: 'iconText', icon: mark._icon ? `/img/settings/${code}/${mark._icon}.svg` : '', value: mark._name }]
	column(code, result, mark, buildingId, setSettingAu)
	return result
}
// Колонки строки
function column(code, result, mark, buildingId, setSettingAu) {
	mark.list.forEach((ml) => {
		const obj = { build: buildingId, type: code, name: mark._code + '.' + ml._code }
		const setValue = (value) => setSettingAu({ value, ...obj })
		switch (ml.type) {
			case 'number':
				// console.log('ml', ml)
				// Редактируемое поле
				result.push({
					field: 'input',
					code: mark._code + '.' + ml._code,
					type: 'number',
					step: 0.1,
					min: ml.min,
					max: ml.max,
					setValue,
					factory: ml.value ?? '',
				})
				// Заводская настройка (Если одна колонка markList)
				if (mark.list.length === 1) result.push({ field: 'text', value: ml.value })
				// Единица измерения
				if (mark.list.length === 1 && ml.unit) result.push({ field: 'text', value: ml.unit })
				break
			case 'boolean':
				// Редактируемое поле
				result.push({ field: 'switch', code: mark._code + '.' + ml._code, setValue, factory: ml.value ?? '' })
				// Заводская настройка (Если одна колонка markList)
				if (mark.list.length === 1) result.push({ field: 'text', value: ml.value ? 'Вкл' : 'Выкл' })
				break
			case 'time':
				result.push({ field: 'input', code: mark._code + '.' + ml._code, type: 'time', setValue, factory: ml.value ?? '' })
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

export { sty, rack }

// const stg = [
// 	'drying',
// 	'mois',
// 	'antibliz',
// 	'over_vlv',
// 	'heating',
// 	'vent',
// 	'cooling',
// 	'accel',
// 	'idle',
// 	'cure',
// 	'heat',
// 	'co2',
// 	'ozon',
// 	'wetting',
// 	'cooler',
// 	'heater',
// ]
// function datalist(
// 	type,
// 	build,
// 	factory,
// 	setSettingAu,
// 	sendSettingAu,
// 	equipSect,
// 	retainTune,
// 	tune,
// 	sendTune,
// 	onSwitch,
// 	prd
// ) {
// 	const data = def[type]
// 	if (!data) return null
// 	if (stg.includes(type)) {
// 		data.list = list?.[type](factory?.[type], setSettingAu, build, prd?.name)
// 		data.warn = { ...data.warn, action: sendSettingAu }
// 		return data
// 	}
// 	if (type === 'tuneup') {
// 		data.list = listVlv(equipSect, retainTune, tune, onSwitch)
// 		data.warn = { ...data.warn, action: sendTune }
// 	}
// 	if (type === 'sys') {
// 		data.list = listSys(setSettingAu, build, prd?.name)
// 		data.warn = { ...data.warn, action: sendSettingAu }
// 	}
// 	return data
// }
