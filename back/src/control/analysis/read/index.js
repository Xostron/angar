const readJson = require('@tool/json').read
const readVal = require('@tool/control/read')

// Опрос модулей
function read(obj) {
	return new Promise((resolve, reject) => {
		// json-файлы: конфигурация модулей
		readJson(['module', 'equipment', 'building'])
			.then(([module, equipment, building]) => {
				let p = []
				if (!building || !building?.length) return []
				for (const b of building) {
					const m = module
						.filter((m) => m.buildingId == b._id)
						.map((m) => ({ ...m, ...equipment[m.equipmentId] }))
					p.push(readVal(m, obj))
				}
				// Опрос модулей по сети
				return Promise.all(p)
			})
			.then((arr) => {
				let r = {}
				arr.forEach((o) => {
					if (!o) return
					r.error ??= []
					if (o.error) r.error.push(o.error)
					delete o.error
					r = { ...r, ...o }
				})
				resolve(r)
			})
			.catch(reject)
	})
}

module.exports = read
