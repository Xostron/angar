const state = require('./STATE.json')
const path = require('path')
const fsp = require('fs/promises')

const ph = path.resolve(__dirname, 'STATE_1.md')
let Total = `# STATE: Данные передаваемы от Angar -> Tenta\n# Структура:\n`
state.forEach((el) => {
	const row = `-	\`${el.key} - ${JSON.stringify(el.value)}\` - \n`
	Total += row
})

fsp.writeFile(ph, Total)
