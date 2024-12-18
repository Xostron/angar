const { data: store, setCmd, setCmdT } = require('@store')

function fnVlv(vlv, obj) {
	// value = open, close, stop
	const { buildingId, valveId, value, sp } = obj

	const moduleOpn = vlv.module.on.id
	const moduleCls = vlv.module.off.id
	const chOpn = +vlv.module.on.channel - 1
	const chCls = +vlv.module.off.channel - 1
	const curpos = +store.value.retain[buildingId].valvePosition[valveId]
	const maxpos = +store.value.retain[buildingId].valve[valveId]

	let s = {}
	let t = {}

	switch (value) {
		case 'opn':
			s[buildingId] ??= {}
			s[buildingId][moduleOpn] ??= {}
			s[buildingId][moduleCls] ??= {}
			s[buildingId][moduleOpn][chOpn] = 1
			s[buildingId][moduleCls][chCls] = 0
			break
		case 'cls':
			s[buildingId] ??= {}
			s[buildingId][moduleOpn] ??= {}
			s[buildingId][moduleCls] ??= {}
			s[buildingId][moduleOpn][chOpn] = 0
			s[buildingId][moduleCls][chCls] = 1
			break
		case 'stop':
			s[buildingId] ??= {}
			s[buildingId][moduleOpn] ??= {}
			s[buildingId][moduleCls] ??= {}
			s[buildingId][moduleOpn][chOpn] = 0
			s[buildingId][moduleCls][chCls] = 0
			break
		default:
			const spp = (+sp * maxpos) / 100
			const hyst = (1 * maxpos) / 100
			if (spp > curpos) {
				// Открыть клапан
				s[buildingId] ??= {}
				s[buildingId][moduleCls] ??= {}
				s[buildingId][moduleCls][chCls] = 0
				// уставка
				t[buildingId] ??= {}
				t[buildingId][moduleOpn] ??= {}
				t[buildingId][moduleOpn][chOpn] = {
					value: 1,
					time: spp,
					type: 'on',
					_id: valveId,
				}
			}
			if (spp < curpos) {
				// Закрыть клапан
				s[buildingId] ??= {}
				s[buildingId][moduleOpn] ??= {}
				s[buildingId][moduleOpn][chOpn] = 0
				// уставка
				t[buildingId] ??= {}
				t[buildingId][moduleCls] ??= {}
				t[buildingId][moduleCls][chCls] = {
					value: 1,
					time: spp,
					type: 'off',
					_id: valveId,
				}
			}
			if (spp < curpos + hyst && spp > curpos - hyst) return

			setCmdT(t)
			break
	}
	// Команда управления
	setCmd(s)
}

module.exports = fnVlv
