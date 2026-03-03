function banner(idB, data) {
	return Object.keys(data?.alarm?.banner ?? {})
		.map((key) => {
			const ba = data?.alarm?.banner?.[key]?.[idB]
			switch (key) {
				case 'local': {
					const r = Object.values(ba ?? {})?.filter((el) => !!el)
					return r?.length ? { code: key, msg: r?.[0]?.msg } : null
				}
				case 'supply': {
					const r = Object.values(ba ?? {}).filter((el) => !!el)
					return r?.length ? { code: key, msg: r?.[0]?.msg } : null
				}
				default:
					// case 'connect':
					// case 'notTune':
					// case 'battery':
					// case 'sb':
					return ba ? { code: key, msg: ba.msg } : null
			}
		})
		.filter((el) => !!el)
}

module.exports = banner
