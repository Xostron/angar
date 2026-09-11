const { fnSens } = require('@tool/web/bld/fn')
const { fnSMode, fnSFan, fnVlv } = require('../fn')

function normalScard(bld, sec, obj) {
	return {
		idS: sec._id,
		idB: bld._id,
		order: sec.order ?? '--',
		name: sec.name ?? '--',
		mode: fnSMode(bld._id, sec._id, bld.type, obj?.retain),
		sensor: [
			fnSens(sec._id, obj, 'tprd', 'min', 'grad', 'tmin'),
			fnSens(sec._id, obj, 'tprd', 'max', 'grad', 'tmax'),
		],
		fan: fnSFan(sec._id, obj) ? 'Вкл' : 'Выкл',
		valve: fnVlv(sec._id, obj),
	}
}

module.exports = normalScard
