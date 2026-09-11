const { fnSens } = require('@tool/web/bld/fn')
const { fnSMode, fnCombiSFan, clrMode } = require('../fn')

function coldScard(bld, sec, obj) {
	return {
		idS: sec._id,
		idB: bld._id,
		order: sec.order ?? '--',
		name: sec.name ?? '--',
		mode: fnSMode(bld._id, sec._id, bld.type, obj?.retain),
		clrMode: clrMode(sec._id, obj)?.name,
		sensor: [
			fnCombiSFan(sec._id, obj),
			fnSens(sec._id, obj, 'tprd', 'min', 'grad', 'tmin'),
			fnSens(sec._id, obj, 'tprd', 'max', 'grad', 'tmax'),
		],
	}
}

module.exports = coldScard
