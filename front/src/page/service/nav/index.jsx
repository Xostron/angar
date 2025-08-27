import Item from './item'

export default function Nav() {
	return (
		<nav className='page-service-nav'>
			{lists.map((el) => (
				<Item key={el.path} data={el} />
			))}
			{/* <Item
				data={{
					path: '..',
					icon: '/img/arrow-left.svg',
					name: 'Выйти',
				}}
			/> */}
		</nav>
	)
}

const lists = [
	{
		path: '../service/1',
		icon: '/img/service/wifi.svg',
		name: 'Настройки сети',
	},
	{
		path: '../service/2',
		icon: '/img/service/project-configuration.svg',
		name: 'Конфигурация',
	},
	{
		path: '../service/3',
		icon: '/img/service/network-2.svg',
		name: 'Обновить ПО',
	},
	{
		path: '../service/4',
		icon: '/img/service/laptop.svg',
		name: 'Управление POS',
	},
	// {
	// 	path: '..',
	// 	icon: '/img/arrow-left.svg',
	// 	name: 'Выйти',
	// },
]
