// Формирование строк
export default function listVlv(equipSect = [], retainTune, tune, onSwitch) {
	const r = []
	// Секции склада
	equipSect.forEach((s, i) => {
		if (!s.valve) return
		// Заголовок Секции Х
		const group = clone(cfgGroup)
		group[0].value = s.name || ''
		if (i == 0) group.push({ field: 'head', value: 'Калибровка' }, { field: 'head', value: 'Статус' })
		r.push(group)
		// клапаны секции
		s.valve.forEach((vlv) => {
			// Поля строки
			const row = clone(cfgRow)
			// Имя клапана
			row[0].value = vlv.type === 'in' ? 'Приточный клапан' : 'Выпускной клапан'
			// Калибровка: Switch - обработчик
			row[1].setValue = (val) => onSwitch(vlv, val)
			row[1].value = tune?.[vlv._id]?._stage == null ? false : true
			// Статус калибровки
			row[2].value = (+retainTune?.[vlv._id] / 1000).toFixed(3) + ' сек.'
			r.push(row)
		})
	})
	return r
}
// Строка клапана
const cfgRow = [
	{
		field: 'iconText',
		code: 'valve',
		icon: '/img/periphery/valve/vout/popn.svg',
		value: '',
	},
	{
		field: 'switch',
	},
	{ field: 'text', value: '-' },
]
// Строка название секции
const cfgGroup = [{ field: 'title', value: '' }]

// Клонирование массива
function clone(arr) {
	const r = []
	for (const i of arr) {
		const t = {}
		Object.assign(t, i)
		r.push(t)
	}
	return r
}
