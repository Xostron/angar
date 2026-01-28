const bldSens = ['outTemp', 'outMois', 'inTemp', 'inMois', 'pin', 'pout']
const sectSens = ['tcnl', 'tprd', 'p', 'co2', 'aifc']
const puiSens = ['Ua', 'Ub', 'Uc', 'Ia', 'Ib', 'Ic', 'Pa', 'Pb', 'Pc']

/**
 * Список рамы датчиков
 * @param {object} build рама склада
 * @param {object} section рама секции
 * @param {object[]} sections рама всех секций
 * @param {string} sect url параметр
 * @returns {object[]}
 */
export function sensList(build, section, sections, sect) {
	let data = []
	switch (sect) {
		case 'all':
			// Прогноз погоды
			build?.tweather ? data.push(build.tweather) : null
			bldSens.forEach((el) => (build?.[el]?.length ? data.push(...build?.[el]) : null))
			break
		case 'pui':
			data = sections
				.flatMap((el) => el.device?.filter((d) => d?.device?.code === 'pui').map((d) => ({ _id: d._id, sectName: el.name })))
				.filter((el) => el)
			break
		default:
			sectSens.forEach((el) => (section?.[el]?.length ? data.push(...section?.[el]) : null))
			section?.cooler?.forEach((clr) => (clr?.sensor?.length ? data.push(...clr?.sensor) : null))
			break
	}
	return data
}
