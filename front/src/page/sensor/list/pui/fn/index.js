import defImg from '@tool/icon'

/**
 * Получить список показаний
 * @param {object[]} data список устройств электроизмерения
 * @param {object} input данные с показаниями
 * @returns {object[]} строки с показаниями
 */
export default function fnList(data, input) {
	const r = []
	data.forEach((el, i) => {
		if (!el) return
		const d = input[el?._id]
		// Линии заголовки
		if (data.length > 1) r.push({ name: el.sectName, type: 'text' })
		// Линии показаний
		for (const key in d) {
			if (!['Ua', 'Ub', 'Uc', 'Ia', 'Ib', 'Ic'].includes(key)) continue
			let name, unit, icon
			switch (key[0]) {
				case 'U':
					name = `Напряжение по входу ${key}`
					unit = 'В'
					icon = defImg.electro.voltage
					break
				case 'I':
					name = `Ток по входу ${key}`
					unit = 'А'
					icon = defImg.electro.current
					break
				case 'P':
					name = `Мощность по входу ${key}`
					unit = 'Вт'
					icon = defImg.electro.power
					break
				default:
					break
			}
			r.push({ name, unit, value: d[key], type: 'value', icon })
		}
	})
	return r
}
