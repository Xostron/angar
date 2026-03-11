// Номер по умолчанию
function main(doc, year) {
	if (!doc.value) return 0;
	if (!year) return doc.value;
	year = year.toString();
	return `${year}-${doc.value}`;
}

module.exports = { main };
