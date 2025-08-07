import { useParams } from 'react-router-dom'
import IconText from '@cmp/fields/icon_text'
import Switch from '@cmp/fields/switch'
import Text from '@cmp/fields/text'
import useInputStore from '@store/input'

export default function Data({ prd, bType }) {
	let { build } = useParams()
	// Время сушки в днях
	const [count, day, inp] = useInputStore(({ input }) => [
		input?.retain?.[build]?.drying?.acc,
		input?.retain?.[build]?.setting?.drying?.[prd]?.day?.day ?? input?.factory?.drying?.[prd]?.day?.day,
		input?.retain,
	])
	if (bType=='cold') return
	return (
		<div className='data'>
			<IconText
				data={{
					value: 'Постоянный вентилятор',
					icon: '/img/periphery/fan/stop.svg',
				}}
				style={{ gridColumn: '1 /span 5' }}
				cls='cell-entry'
			/>
			<Switch value={false} setValue={() => {}} />
			<IconText
				data={{
					value: 'Время сушки в днях',
					icon: '/img/periphery/clock/clock.svg',
				}}
				style={{ gridColumn: '1 /span 4' }}
				cls='cell-entry'
			/>
			<Text
				data={{
					value: day,
				}}
			/>
			<Text data={{ value: 'Дни' }} />
			<IconText
				data={{
					value: 'Прошло дней',
					icon: '/img/periphery/clock/clock.svg',
				}}
				style={{ gridColumn: '1 /span 4' }}
				cls='cell-entry'
			/>
			<Text data={{ value: Math.trunc(count) }} />
			<Text data={{ value: 'Дни' }} />
		</div>
	)
}
