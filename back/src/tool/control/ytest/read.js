// Тест для чтения данных модулей
const read = require('./read')

const arr = [
	{
		ip: 'COM5',
		port: 1,
		name: 'МВ110-8А',
		interface: 'rtu',
		channel: 8,
		start: 3,
		step: 6,
		type: 'float'
	},
	{
		ip: 'COM5',
		port: 2,
		name: 'МВ110-8АC',
		interface: 'rtu',
		channel: 8,
		start: 287,
		step: 3,
		type: 'float'
	},
	{
		ip: 'COM5',
		port: 3,
		name: 'МУ110-8К',
		interface: 'rtu',
		channel: 8,
		start: 0,
		step: 1,
		type: 'int'
	},
	{
		ip: 'COM5',
		port: 4,
		name: 'МУ110-16К',
		interface: 'rtu',
		channel: 16,
		start: 0,
		step: 1,
		type: 'int'
	},
	{
		ip: 'COM5',
		port: 5,
		name: 'МВ110-32ДН',
		interface: 'rtu',
		channel: 32,
		start: 99,
		step: 1,
		type: 'boolean'
	}
]
read(arr)
	.then(a => console.log('Данные модулей', a))
	.catch(console.log)


