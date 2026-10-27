import fnCell from './cell'

// Собираем таблицу с настройками
export default function setting(list, code, idB, setSettingAu, showHid) {
	return !list ? [] : list.map((el) => row(el, code, idB, setSettingAu, showHid))
}

// Формирование строки (1 ячейка оглавление, остальные ячейки в mark.list (функция column))
function row(mark, code, idB, setSettingAu, showHid) {
	let result = []
	// 1 ячейка по-умолчанию
	const cell = {
		field: mark._type === 'txt' || mark._code.includes('text-collapse') ? 'title' : 'iconText',
		icon: mark._icon ? `/img/settings/${code}/${mark._icon}.svg` : '',
		value: mark._name,
	}

	if (mark._code.includes('info')) cell.field = 'info'

	// Добавляем в ячейку - раму для кнопки скрыть/показать
	if (mark._code.includes('text-collapse') && showHid) {
		// Добавление в строку кнопки "скрыть\показать неактивные настройки"
		cell.nameHid = `${code}.${mark._code}`
	}

	// Флаг "Отключить редактирование" если кнопка скрыть/показать = скрыть
	// if (!!show && show.includes(mark?._code)) mark.list.forEach((el) => (el._acv = true))

	result.push(cell)
	// Форматируем остальные ячейки
	fnCell(code, result, mark, idB, setSettingAu)

	return result
}
