const { writeSync } = require('@tool/json')

/**
 * Преобразование и сохранение заводских настроек
 * @param {*} factory Заводские настройки от админ-сервера
 * @param {*} phF Путь сохранения
 * @returns Сохранение json: ./data/factory/factory.json
 */
function transformF(factory, phF) {
	if (!factory || !phF) return
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

module.exports = transformF
