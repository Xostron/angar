import def from '../def/index'
import listVlv from '../def/tuneup/fn'
import setting from './row'

/**
 * Конфиг grid сетки для таблиц настроек
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
		// gridTemplateRows: `repeat(${ll},var(--fsz65))`,
		gridTemplateRows: `repeat(${ll}, minmax(var(--fsz65), max-content))`,
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
 * Структура:
 * head - Шапка таблицы: Наименование столбцов
 * title -Шапка таблицы: Оглавление таблицы и кнопка сохранить
 * warn - Шапка таблицы: диалоговое окно для кнопки Сохранить
 * list - Список строк и ячеек, например настройки сушки
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
function rack(obj, stgV, setSettingAu, sendSettingAu, sendTune, onSwitch) {
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
	data.list = setting(fct?.list, code, buildingId, stgV, setSettingAu, prd === curPrd)

	// Максимальное кол-во ячеек в строке (для правильной css отрисовки)
	const max = Math.max(...data.list.map((el) => el?.length))
	// Название колонок: "Значения","Заводские","Ед. измерения"
	data.head = fnHead(code, max)

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

export { sty, rack }

function fnHead(code, max) {
	switch (code) {
		// Настройка "Время работы" (таймеры запретов)
		case 'idle':
		case 'idleCold':
			return ['Начало', 'Конец', '']

		// По-умолчанию
		default:
			return ['Значения', 'Заводские', 'Ед. измерения'].slice(0, max - 1)
	}
}
