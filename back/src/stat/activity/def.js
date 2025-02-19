const mes = require('@dict/message')
const reset = require('./reset')
const start = require('./start')
const automode = require('./automode')
const product = require('./product')
const mode = require('./mode')
const fan = require('./fan')
const sensor = require('./sens')
const setting = require('./setting')
const valve = require('./valve')

module.exports = {
	// Web клиент
	// Сброс аварии
	s_reset: reset,
	// Пуск склада
	s_start: start,
	// Смена авторежима
	s_auto_mode: automode,
	// Смена продукта
	s_product: product,
	// Смена режимов секции
	s_mode: mode,
	// Управление вентилятором
	s_fan: fan,
	// Настройки датчиков
	s_sens: sensor,
	// Настройки авторежимов
	s_setting_au: setting,
	// Калибровка клапанов
	s_tune: (code, obj, oData) => {
		const { section, building } = oData
		let title, bId
		for (const vId in obj) {
			if (title) continue
			const v = obj[vId]
			if (!v?._stage) continue
			const sect = section.find((el) => v.sectionId.includes(el._id))
			if (!sect) continue
			const bld = building.find((el) => el._id == sect.buildingId)
			if (!bld) continue
			bId = bld._id
			title = `${bld.name} ${bld.code}: Калибровка клапанов`
		}
		return title ? { bId, title, type: code } : { noLog: true }
	},
	// Прогрев клапанов
	s_warming: (code, obj, oData) => {
		const { buildingId, sectionId, cmd } = obj
		const { section, building } = oData
		const bld = building.find((el) => el._id == buildingId)
		const sec = section.find((el) => el._id == sectionId)
		const title = cmd
			? `${bld.name} ${bld.code}. ${sec.name}: Прогрев клапанов включен`
			: `${bld.name} ${bld.code}. ${sec.name}: Прогрев клапанов выключен`
		return { bId: bld._id, sId: sec._id, type: code, title, value: cmd }
	},
	// Управление клапаном
	s_output:valve,

	// Мобильный клиент
	reset,
	start,
	automode,
	product,
	section: mode,
	fan,
	sensor,
	setting,
	valve
}
