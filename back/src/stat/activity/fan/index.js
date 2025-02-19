const mes = require('@dict/message')
module.exports = (code, obj, oData) => {
	const { title, value } = web(code, obj, oData) ?? mobile(code, obj, oData) ?? {}
	return { title, value, type: 'fan' }
}

function web(code, obj, oData) {
	if (code !== 's_fan') return
	const { fan } = oData
	const f = fan.find((el) => el._id == obj.fanId)
	if (obj.action === 'run') return { title: mes[510](f.name), value: obj.action }
	if (obj.action === 'stop') return { title: mes[511](f.name), value: obj.action }
	if (obj.action === 'off') return { title: obj.value ? mes[512](f.name) : mes[513](f.name), value: obj.value ? 'off' : 'on' }
	return
}

function mobile(code, obj, oData) {
	if (code !== 'fan') return
	const { fan } = oData
	const f = fan.find((el) => el._id == obj.fanId)
	if (obj.val === 'run') return { title: mes[510](f.name), value: obj.val, type: code }
	if (obj.val === 'stop') return { title: mes[511](f.name), value: obj.val, type: code }
	if (obj.val === 'off' || obj.val === true)
		return { title: obj.val === 'off' ? mes[512](f.name) : mes[513](f.name), value: obj.val === 'off' ? 'off' : 'on' }
	return
}
