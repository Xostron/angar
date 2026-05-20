/**
 * Расчет электроэнергии по точкам
 * @param {object[]} arr показания электроэнергии {мощность, время показания}
 */
function electricity(arr) {
	if (!arr.length) return
	let sum = 0
	for (let i = 1; i <= arr.length; i++) {
		const prev = arr[i - 1]
		const cur = arr[i]
		const deltaT = cur.time - prev.time
		sum += prev.val * deltaT + ((cur.val - prev.val) * deltaT) / 2
	}
	return sum
}
