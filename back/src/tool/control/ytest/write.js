// Тест записи данных в модули
const write = require('./write')

const arr = [
	{
		ip: 'COM5',
		port: 3,
		name: 'МУ110-8К',
		value: [0, 0, 0, 0, 0, 0, 0, 0],
		interface: 'rtu',
		channel: 8,
		start: 0,
		step: 1,
		type: 'int',
		on: 1000
	},
	{
		ip: 'COM5',
		port: 4,
		name: 'МУ110-16К',
		value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		interface: 'rtu',
		channel: 16,
		start: 0,
		step: 1,
		type: 'int',
		on: 1000
	}
]

write(arr)
	.then(o => console.log('Состояние модулей', o))
	.catch(console.log)


