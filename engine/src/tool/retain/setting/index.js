const { ms } = require('@tool/command/time')


// Получить значение определенного поля настройки
function getDef(idB, retain, code, name) {
	const prd = retain?.[idB]?.product?.code
	const r = retain?.[idB]?.setting?.[code]?.[prd]?.[name]?.[name]
	return ms(r)
}

module.exports = { getDef }
