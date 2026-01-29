const { data: store } = require('@store')
const { readOne } = require('@tool/json')

/**
 * Получить данные страницы Датчики
 * @param {*} params Параметры запроса
 * @param {*} id
 */
async function fnList(params) {
	const { bldId, secId } = params
	// Рама секций
	const section = await readOne('section')
	const list = section
		.filter((el) => el.buildingId == bldId)
		.map((el) => {
			delete el.status
			delete el.buildingId
			return el
		})
	// Рама устройств электроизмерения (pui) склада
	const device = await readOne('device')
	const secIds = list.map((el) => el._id)
	const pui = device.filter((el) => {
		if (secIds.includes(el.sectionId) && el.device.code == 'pui')
			return (el.sectName = list.find((ss) => ss._id === el.sectionId)?.name)
	})
	// Рама датчиков
	const sensor = await readOne('sensor')
	// Рама binding - аналоговые входа
	const binding = await readOne('binding')
	const fan = await readOne('fan')
	let ai = binding.filter((el) => el.type === 'ai')
	ai = ai.map((s) => {
		// Пока что владельцами binding аналоговых входов являются ВНО
		const own = fan.find((el) => el._id === s.owner.id)
		s.owner.id = own.owner.id
		s.owner.type = own.owner.type
		s.name = `Ток ${own?.name}`
		return s
	})

	// Список навигации = рама секций + Сеть + Общие
	if (pui?.length) list.unshift({ _id: 'pui', name: `Сеть` })
	list.unshift({ _id: 'all', name: 'Общие' })

	return { list, sensor: sensList(params, [...sensor, ...ai], pui) }
}

module.exports = fnList

/**
 * Получить список значений от датчиков
 * @param {*} params Параметры запроса
 * @param {*} sensor Рама датчиков + рама binding ai
 * @param {*} pui рама устройств
 * @returns
 */
function sensList(params, sensor, pui, ) {
	const { bldId, secId } = params
	// Данные датчиков конкретной секции или ангара
	const id = secId === 'all' ? bldId : secId === 'pui' ? 'pui' : secId

	// Данные датчиков (склада || секция || Электроизмерения)
	let list = []
	if (id === 'pui') list = puiList(pui, store?.value)
	else list = sensor.filter((el) => el.owner.id === id).map((el) => sens(el, store?.value, bldId))

	return list
}

/**
 *
 * @param {*} pui Список устройств электроизмерения
 * @param {*} value Показания датчиков
 */
function puiList(pui, value) {
	const r = []
	pui.forEach((el, i) => {
		const d = value[el._id]
		// Линии заголовки
		if (pui.length > 1) r.push({ _id: el._id + 'title', title: el.sectName })
		// Линии показаний
		for (const key in d) {
			if (!['Ua', 'Ub', 'Uc', 'Ia', 'Ib', 'Ic'].includes(key)) continue
			let _id, title, code
			switch (key[0]) {
				case 'U':
					_id = el._id + key
					title = `Напряжение по входу ${key}`
					code = 'voltage'
					break
				case 'I':
					_id = el._id + key
					title = `Ток по входу ${key}`
					code = 'current'
					break
				// case 'P':
				// 	_id: el._id+key,
				// 	title = `Мощность по входу ${key}`
				// 	code = 'power'
				// 	break
				default:
					break
			}
			r.push({ _id, title, value: d[key], code })
		}
	})
	return r
}

/**
 * Получить из рамы значение датчика
 * @param {object} s Рама датчика
 * @param {object} v Показания датчиков
 * @param {string} buildingId
 * @returns {object} Значение датчика
 */
function sens(s, v, buildingId) {
	return {
		_id: s._id,
		code: s.type,
		title: s.name,
		mode: v.retain?.[buildingId]?.[s._id]?.on ?? true,
		correction: v.retain?.[buildingId]?.[s._id]?.corr ?? 0,
		value: v?.[s._id]?.value,
	}
}
