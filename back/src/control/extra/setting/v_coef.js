const { data: store } = require('@store')


const ref = {
	sys: [['out', 'kOut']],
	fan: [['pressure']],
	mois: [['abs'], ['hout']],
	co2: [['wait']],
}
// Собираем данные для отображения в настройках клиента
function vCoef(v, idB) {
	// По настройкам (ключам) ref = sys, fan, mois, co2
	for (const key in ref) {
		if (!ref[key] || !ref[key]?.length) continue
		// По рассчитанным настройкам кооэффициенты в зависимости от
		for (const field of ref[key]) {
			if (!field || !field?.length) continue
			v.coef[idB][key] ??= {}
			const [fld1, fld2] = field
			v.coef[idB][key][fld1] ??= {}
			v.coef[idB][key][fld1] = !fld2
				? store.calcSetting[idB][key][fld1]
				: store.calcSetting[idB][key][fld1][fld2]
		}
	}

}

module.exports = vCoef
