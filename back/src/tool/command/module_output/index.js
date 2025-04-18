const { setCmd } = require('@tool/command/set')

// Записть в аналоговый выход
function ctrlAO(o, bldId, value) {
	if (typeof value != 'number' || Number.isNaN(value)) return
	console.log(999, o.name, `Аналоговый выходв ${value} %`)
	const mdlId = o?.ao?.id
	const ch = o?.ao?.channel - 1
	const r = { [bldId]: { [mdlId]: { [ch]: value } } }
	setCmd(r)
}

/**
 * Команда управления периферией (вкл/выкл)
 * @param {*} obj Вентилятор и т.д.
 * @param {*} buildingId Ссылка на склад
 * @param {*} type Тип команды включить/выключить (on, off)
 * @returns
 */
function ctrlDO(obj, buildingId, type) {
	if (!type) return null
	const bldId = obj?._build ?? buildingId
	const mdlId = obj?.module?.id
	const ch = obj?.module?.channel - 1
	const r = {}
	if (type === 'on') {
		r[bldId] = { [mdlId]: { [ch]: 1 } }
	}
	if (type === 'off') {
		r[bldId] = { [mdlId]: { [ch]: 0 } }
	}
	setCmd(r)
}

/**
 * Управление клапаном открыть/закрыть/стоп
 * @param {*} vlv Клапан
 * @param {*} type Тип команды (open,close,stop)
 * @returns
 */
function ctrlV(vlv, buildingId, type) {
	if (!type) return null
	const bldId = vlv?._build ?? buildingId
	const mdlOn = vlv?.module?.on?.id
	const mdlOff = vlv?.module?.off?.id
	const chOn = vlv?.module?.on?.channel - 1
	const chOff = vlv?.module?.off?.channel - 1
	// Защита от клапанов без привязки модулей в админпанели
	if (!mdlOn || !mdlOff || isNaN(chOn) || isNaN(chOff)) return null

	const r = {}
	// stop
	r[bldId] = { [mdlOn]: { [chOn]: 0 } }
	r[bldId] = { ...r[bldId], [mdlOff]: { ...r[bldId][mdlOff], [chOff]: 0 } }

	if (type === 'open') {
		r[bldId][mdlOn][chOn] = 1
		r[bldId][mdlOff][chOff] = 0
	}
	if (type === 'close') {
		r[bldId][mdlOn][chOn] = 0
		r[bldId][mdlOff][chOff] = 1
	}
	if (r) setCmd(r)
}

module.exports = { ctrlAO, ctrlDO, ctrlV }
