const { setCmd, setCmdT } = require('@tool/command/set')
const { data: store } = require('@store')
const { ctrlVsp } = require('@tool/command/module_output')

/**
 * Ручное управление от мобилки
 * @param {*} vlv 
 * @param {*} obj 
 */
function fnVlv(vlv, obj) {
	// value = open, close, stop
	const { buildingId, valveId, value, sp } = obj

	const moduleOpn = vlv.module.on.id
	const moduleCls = vlv.module.off.id
	const chOpn = +vlv.module.on.channel - 1
	const chCls = +vlv.module.off.channel - 1
	// const curpos = +store.value.retain[buildingId].valvePosition[valveId]
	// const maxpos = +store.value.retain[buildingId].valve[valveId]

	const s = {}
	// const t = {}
	s[buildingId] ??= {}
	s[buildingId][moduleOpn] ??= {}
	s[buildingId][moduleCls] ??= {}

	switch (value) {
		case 'opn':
			s[buildingId][moduleOpn][chOpn] = 1
			s[buildingId][moduleCls][chCls] = 0
			// Команда управления
			setCmd(s)
			break
		case 'cls':
			s[buildingId][moduleOpn][chOpn] = 0
			s[buildingId][moduleCls][chCls] = 1
			// Команда управления
			setCmd(s)
			break
		case 'stop':
			s[buildingId][moduleOpn][chOpn] = 0
			s[buildingId][moduleCls][chCls] = 0
			// Команда управления
			setCmd(s)
			break
		default:
			ctrlVsp(vlv, buildingId, sp)
			// const spp = (+sp * maxpos) / 100
			// const hyst = (1 * maxpos) / 100
			// if (spp > curpos) {
			// 	// Открыть клапан
			// 	s[buildingId] ??= {}
			// 	s[buildingId][moduleCls] ??= {}
			// 	s[buildingId][moduleCls][chCls] = 0
			// 	// уставка
			// 	t[buildingId] ??= {}
			// 	t[buildingId][moduleOpn] ??= {}
			// 	t[buildingId][moduleOpn][chOpn] = {
			// 		value: 1,
			// 		time: spp,
			// 		type: 'on',
			// 		_id: valveId,
			// 	}
			// }
			// if (spp < curpos) {
			// 	// Закрыть клапан
			// 	s[buildingId] ??= {}
			// 	s[buildingId][moduleOpn] ??= {}
			// 	s[buildingId][moduleOpn][chOpn] = 0
			// 	// уставка
			// 	t[buildingId] ??= {}
			// 	t[buildingId][moduleCls] ??= {}
			// 	t[buildingId][moduleCls][chCls] = {W
			// 		value: 1,
			// 		time: spp,
			// 		type: 'off',
			// 		_id: valveId,
			// 	}
			// }
			// if (spp < curpos + hyst && spp > curpos - hyst) return

			// setCmdT(t)
			// // Команда управления
			// setCmd(s)
			break
	}
	// Команда управления
	// setCmd(s)
}

module.exports = fnVlv
