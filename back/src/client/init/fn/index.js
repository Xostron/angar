const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../../../.env') })
const api = require('@tool/api')
const { factoryDir, dataDir } = require('@store')
const equipment = require('@tool/equipment')
const { writeSync } = require('@tool/json')
const { cEquip } = require('@socket/emit')
const t = [
	'building',
	'equipment',
	'fan',
	'heating',
	'module',
	'pc',
	'product',
	'range',
	'section',
	'sensor',
	'signal',
	'valve',
	'factory',
	'aggregate',
	'device',
	'cooler',
	'binding',
	'weather',
]
/**
 * Запрос конфигурации склада у админ-сервера
 * Сохранение в json
 * Формирование и отправка конфигурации (рамы) на web
 */
async function init() {
	const config = {
		method: 'GET',
		url: 'angar/init',
		headers: { ip: process.env.IP },
	}
	return (
		api(config)
			.then((r) => {
				if (!r?.data?.result) {
					console.log(
						'\x1b[32m%s\x1b[0m',
						`AdminServer ${process.env.API_URI} не отвечает`
					)
					return
				}
				console.log(
					'\x1b[32m%s\x1b[0m',
					`Данные с AdminServer ${process.env.API_URI} получены`
				)
				// Сохранение конфигурации в json
				writeSync(r.data.result, dataDir, t)
				// Заводские настройки в json
				transformF(r?.data?.result?.factory, factoryDir)
				// Формирование рамы для клиента
				return equipment()
			})
			// отправка рамы на клиент
			.then((data) => cEquip(data))
			.catch(console.log)
	)
}
function test1() {
	return 'test1'
}
module.exports =  init

/**
 * Преобразование и сохранение заводских настроек
 * @param {*} factory Заводские настройки от админ-сервера
 * @param {*} phF Путь сохранения
 * @returns Сохранение json: ./data/factory/factory.json
 */
function transformF(factory, phF) {
	if (!factory || !phF) return
	// writeSync(fct, phF, t)
	const fct = {}

	// По настройкам
	for (const key in factory) {
		fct[key] = {
			_prd: factory[key]._prd,
		}
		if (factory[key]._prd) {
			// С продуктом
			// по продукту
			for (const prd in factory[key]) {
				if (prd.substring(0, 1) === '_') continue
				fct[key][prd] = {}
				// по mark
				for (const mark in factory[key][prd]) {
					if (mark.substring(0, 1) === '_') continue
					const m = factory[key][prd][mark]
					fct[key][prd][mark] = {}
					// по markList
					for (const ml in m) {
						if (ml.substring(0, 1) === '_') continue

						const isChoice = m[ml]?.type === 'choice'
						if (isChoice) {
							fct[key][prd][mark][ml] = m[ml]?.value?.[1] ?? null
							continue
						}
						fct[key][prd][mark][ml] = m[ml]?.value ?? null
					}
				}
			}
		} else {
			// Без продукта
			// по mark
			for (const mark in factory[key]) {
				if (mark.substring(0, 1) === '_') continue
				const m = factory[key][mark]
				fct[key][mark] = {}
				// по markList
				for (const ml in m) {
					if (ml.substring(0, 1) === '_') continue

					const isChoice = m[ml]?.type === 'choice'
					if (isChoice) {
						fct[key][mark][ml] = m[ml]?.value?.[1] ?? null
						continue
					}
					fct[key][mark][ml] = m[ml]?.value ?? null
				}
			}
		}
	}

	// Значения заводских настроек (factory/factory.json)
	writeSync({ factory: fct }, phF)
}
