function fnLimit(fanFC, fans, aCmd) {
	if (!aCmd?.force) return null
	if (!aCmd?.max) return -1
	// Настройка "Макс. кол-во ВНО"
	return fanFC ? aCmd?.max - 1 : max
}

module.exports = { fnLimit }
