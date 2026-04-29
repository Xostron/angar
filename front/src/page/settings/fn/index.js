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
	// const firstCell = `calc(100% - ${col} * var(--fsz180) - ${col} * var(--fsz10))`
	const stl = {
		gridArea: `2/2/2/${col + 3}`,
		gridTemplateColumns: `auto repeat(${col}, var(--fsz180))`,
		gridTemplateRows: `repeat(${ll},var(--fsz65))`,
	}

	// Заголовок
	const sth = {
		gridArea: `1/2/2/${col + 3}`,
		gridTemplateColumns: `auto repeat(${col}, var(--fsz180))`,
	}

	// Боковая панель навигации
	const stn = {
		gridArea: `2/${col + 3}/3/${col + 4}`,
		gridTemplateColumns: 'repeat(2, 1fr)',
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
function rack(obj, setSettingAu, sendSettingAu, sendTune, onSwitch) {
	const {
		fct,
		bldType,
		type: code,
		build: buildingId,
		equipSect,
		retainTune,
		tune,
		prd,
		curPrd,
		// show,
		// skip
	} = obj
	const data = { head: [], list: [] }
	// Настройка: Калибровка клапанов
	if (code === 'tuneup' && bldType !== 'cold') {
		const d = def[code]
		d.list = listVlv(equipSect, retainTune, tune, onSwitch)
		d.warn = { ...d.warn, fnYes: sendTune }
		return d
	}
	// Остальные настройки
	// Настройки из БД
	// Заголовок страницы
	data.title = { name: fct?.name, bName: 'Сохранить' }

	// Строки с настройками
	data.list = setting(fct?.list, code, buildingId, setSettingAu, prd === curPrd)

	// Максимальное кол-во ячеек в строке (для правильной css отрисовки)
	const max = Math.max(...data.list.map((el) => el?.length))
	// Название колонок: "Значения","Заводские","Ед. измерения"
	data.head = ['Значения', 'Заводские', 'Ед. измерения'].slice(0, max - 1)

	// Окно подтверждения warn
	data.warn = {
		type: 'warn',
		title: `${fct?.name}`,
		text: `Сохранить настройки?`,
		fnYes: sendSettingAu,
		code,
	}

	return data
}

// Форматирование строк
function setting(list, code, idB, setSettingAu, showHid) {
	return !list ? [] : list.map((el) => row(el, code, idB, setSettingAu, showHid))
}

// Формирование строки (1 ячейка оглавление, остальные ячейки в mark.list (функция column))
function row(mark, code, idB, setSettingAu, showHid) {
	let result = []
	// if (mark._code.includes('text-collapse')) console.log(11, mark.list)
	// console.log(mark)
	// 1 ячейка по-умолчанию
	const cell = {
		field: mark._type === 'txt' || mark._code.includes('text-collapse') ? 'title' : 'iconText',
		icon: mark._icon ? `/img/settings/${code}/${mark._icon}.svg` : '',
		value: mark._name,
	}

	// Добавляем в ячейку - раму для кнопки скрыть/показать
	if (mark._code.includes('text-collapse') && showHid) {
		// Добавление в строку кнопки "скрыть\показать неактивные настройки"
		cell.nameHid = `${code}.${mark._code}`
	}

	// Флаг "Отключить редактирование" если кнопка скрыть/показать = скрыть
	// if (!!show && show.includes(mark?._code)) mark.list.forEach((el) => (el._acv = true))

	result.push(cell)
	// Форматируем остальные ячейки
	column(code, result, mark, idB, setSettingAu)

	return result
}

// Ячейки строки
function column(code, result, mark, idB, setSettingAu) {
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

export { sty, rack }
