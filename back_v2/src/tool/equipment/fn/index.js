// Информация по периферии для складов на WEB
/*result = {building:[
	{
		building: {},
		product:[],
		sensor:[],
		fan:[],
		section:[
			{	
				...section:{}
				sensor:[],
				fan:[],
				valve:[],
				heating:[],
				signal:[]
			},
		],
	},
], 
factory:{}
}*/

const { writeSync } = require('../../json')

// Рама для web
function equip(data) {
	const result = {}
	result.building = [...data.building]
	result.building.forEach((bld, idx) => {
		// pos terminal
		result.building[idx].pc = data.pc || null
		// Продукт склада
		result.building[idx].product = data.product || null
		// Режим работы склада
		// result.building[idx].mode = bld?.mode
		// Модули
		const mdl = data.module.filter((f) => f.buildingId === bld._id)
		result.building[idx].mdl = mdl.length ? mdl : null

		// Периферия склада
		// Температура
		// Внутренняя
		const inTemp = data.sensor.filter((t) => t.owner.id === bld._id && ['tin'].includes(t.type))
		result.building[idx].inTemp = inTemp.length ? inTemp : null
		// Внешняя
		const outTemp = data.sensor.filter((t) => t.owner.id === bld._id && ['tout'].includes(t.type))
		result.building[idx].outTemp = outTemp.length ? outTemp : null

		// Влажность
		// Внутренняя
		const inMois = data.sensor.filter((m) => m.owner.id === bld._id && ['hin'].includes(m.type))
		result.building[idx].inMois = inMois.length ? inMois : null
		// Внешняя
		const outMois = data.sensor.filter((m) => m.owner.id === bld._id && ['hout'].includes(m.type))
		result.building[idx].outMois = outMois.length ? outMois : null

		// Расчетная влажность
		// Внутренняя
		result.building[idx].inCalcMois = { type: 'calcMois' }
		// Внешняя
		result.building[idx].outCalcMois = { type: 'calcMois' }

		// Вентиляторы
		const fan = data.fan.filter((f) => f.owner.id === bld._id)
		result.building[idx].fan = fan.length ? fan : null

		// Секции склада
		const sect = data.section.filter((s) => s.buildingId === bld._id)
		result.building[idx].section = sect.length ? sect : null

		// Периферия секции
		result.building[idx]?.section &&
			result.building[idx]?.section.forEach((s, i) => {
				// Датчики давления
				const p = data.sensor.filter((t) => t.owner.id === s._id && ['p'].includes(t.type))
				// Температура продукта
				const tprd = data.sensor.filter((t) => t.owner.id === s._id && ['tprd'].includes(t.type))
				// Температура канала
				const tcnl = data.sensor.filter((t) => t.owner.id === s._id && ['tcnl'].includes(t.type))
				// Датчики влажности секции
				const mois = data.sensor.filter((m) => m.owner.id === s._id && ['hin'].includes(m.type))
				// Вентиляторы
				const fan = data.fan.filter((f) => f.owner.id === s._id)
				// Клапаны
				const valve = data.valve.filter((v) => v.sectionId.includes(s._id))
				// Сигналы
				// listId - список id вентиляторов и клапанов секции
				const listId = [...fan, ...valve, ...sect].map((el) => el._id)
				const signal = data.signal.filter((sig) => listId.includes(sig.owner.id))
				// Подогрев клапанов
				const heating = data.heating.filter((h) => h.owner.id === s._id)

				result.building[idx].section[i].p = p.length ? p : null
				result.building[idx].section[i].tprd = tprd.length ? tprd : null
				result.building[idx].section[i].tcnl = tcnl.length ? tcnl : null
				result.building[idx].section[i].mois = mois.length ? mois : null
				result.building[idx].section[i].fan = fan.length ? fan : null
				result.building[idx].section[i].valve = valve.length ? valve : null
				result.building[idx].section[i].signal = signal.length ? signal : null
				result.building[idx].section[i].heating = heating.length ? heating : null
			})
	})
	// Заводские настройки - рама
	result.factory = {}
	// по коду настроек
	for (const key in data?.factory) {
		result.factory[key] = {
			_name: data?.factory[key]._name,
			_order: data?.factory[key]._order,
			_prd: data?.factory[key]._prd,
		}
		if (data?.factory[key]._prd) {
			// С продуктом
			// по коду продуктов
			for (const prd in data?.factory[key]) {
				if (prd.substring(0, 1) === '_') continue
				result.factory[key][prd] = []
				// по коду mark
				for (const mark in data?.factory[key][prd]) {
					if (mark.substring(0, 1) === '_') continue
					const m = data?.factory[key][prd][mark]
					const obj = {
						_code: mark,
						_name: m._name,
						_order: m._order,
						_icon: m._icon,
						_type: m?._type,
						list: [],
					}
					// по коду markList
					for (const ml in m) {
						if (ml.substring(0, 1) === '_') continue
						obj.list.push({ ...m[ml], _code: ml })
					}
					obj.list.sort((a, b) => a._order - b._order)
					result.factory[key][prd].push(obj)
				}
				result.factory[key][prd].sort((a, b) => a._order - b._order)
			}
		} else {
			// Без продукта
			result.factory[key].list = []
			// по коду mark
			for (const mark in data?.factory[key]) {
				if (mark.substring(0, 1) === '_') continue
				const m = data?.factory[key][mark]
				let obj = {
					_code: mark,
					_name: m._name,
					_order: m._order,
					_icon: m._icon,
					_type: m?._type,
					list: [],
				}
				// по коду markList
				for (const ml in m) {
					if (ml.substring(0, 1) === '_') continue
					obj.list.push({ ...m[ml], _code: ml })
				}
				obj.list.sort((a, b) => a._order - b._order)
				result.factory[key].list.push(obj)
			}
			result.factory[key].list.sort((a, b) => a._order - b._order)
		}
	}
	// writeSync({ equip_factory: result.factory }, 'D:/Work/Projects/All/angar/v2/back/data/factory')
	return result
}

const withPrd = ['drying', 'cooling', 'cure', 'heat', 'vent', 'mois', 'sys', 'wetting', 'cooler']

module.exports = equip
