const { readOne } = require("@tool/json")

// Рама сервисов, также создаем url_api к микросервису
async function getServices() {
	const services = await readOne('io.json')
	return services.map((srv) => ({ ...srv, url: `http://${srv.ip}:${srv.port}/api/` }))
}

/**
 * Список модулей для данного микросервиса
 * @param {*} module Общая рама модулей
 * @param {*} list Модули микросервиса
 */
function getMdlSrv(module, list = []) {
	// Список пуст - значит микросервис опрашивает все модули
	if (!list?.length) return module
	// Время жизни опроса модулей 1 час
	const expired = new Date(Date.now() + 3600 * 1000)
	return list
		.map((mdlId) => {
			const m = module.find((el) => el.id === mdlId)
			if (!m) return null
			// Время жизни опроса модулей 1 час
			return { ...m, expired }
		})
		.filter(Boolean)
}

/**
 * Актуализация аварий модулей на ангаре
 * @param {*} all Аварии модулей на ангаре
 * @param {*} now Аварии модулей от микросервиса
 * @param {*} list Список ИД модулей
 */
async function mergeAlr(all, now, list) {
	// Рама модулей
	const module = await readOne('module.json')

	// Список модулей для данного микросервиса
	const mdls = getMdlSrv(module, list)

	mdls.forEach(({ _id, buildingId }) => {
		// Если авария существует в ответе от микросервисаб то сохраняем ее в all
		if (now?.[buildingId]?.[_id]) {
			all[buildingId] ??= {}
			all[buildingId][_id] = nowall[buildingId][_id]
		} else {
			// Аварии нет в ответе от микросервиса, удаляем из all
			delete all?.[buildingId]?.[_id]
		}
	})
}

module.exports = { getServices, getMdlSrv, mergeAlr }
