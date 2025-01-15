import useInputStore from '@store/input'
import Row from '../row'
import Text from '@cmp/fields/text'
import IconText from '@cmp/fields/icon_text'

// Список датчиков: сеть
export default function Pui({ data }) {
	const [input] = useInputStore(({ input }) => [input])
	// console.log(111, input)
	const data1 = [
		{ _id: '6787712732e29408bc9fa4c3', sectName: 'Секция 1' },
		{ _id: '6787712732e29408bc9fa4c2', sectName: 'Секция 1' },
		{ _id: '6787712732e29408bc9fa4c1', sectName: 'Секция 1' },
	]
	const r = []
	data1.forEach((el, i) => {
		const d = input[el._id]
		if (d) r.push({ name: el.sectName })
		for (const key in d) {
			if (key === 'state') continue
			let name, unit
			switch (key[0]) {
				case 'U':
					name = `Напряжение по входу ${key}`
					unit = 'В'
					break
				case 'I':
					name = `Ток по входу ${key}`
					unit = 'А'
					break
				case 'P':
					name = `Можность по входу ${key}`
					unit = 'Вт'
					break
				default:
					break
			}
			r.push({ name, unit, value: d[key] })
		}
	})
	let cl = ['cell-w']
	cl = cl.join(' ')
	// console.log(r)
	const listSen = {gridTemplateColumns: '70% repeat(2, 1fr)'}
	return (
		<section className='list-sen' style={listSen}>
			{r.map((el, i) => (

				<>
					<IconText cls={cl} data={{ value: el.name }} />
					<Text cls={cl} data={{ value: el.value }} />
					<Text cls={cl} data={{ value: el.unit }} />
				</>
			))}
		</section>
	)
}
