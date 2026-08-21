import { useParams } from 'react-router-dom'
import IconText from '@cmp/fields/icon_text'
import Switch from '@cmp/fields/switch'
import Text from '@cmp/fields/text'
import useInputStore from '@store/input'

export default function Data({ prd, bType, style }) {
	let { build } = useParams()
	// Счетчик сушки в днях
	let total = useInputStore(({ input }) => input?.retain?.[build]?.drying?.total ?? 0)

	total = +(total / 18 / 3600 / 1000).toFixed(1)
	// Прошло дней
	const day = useInputStore(
		({ input }) =>
			input?.retain?.[build]?.setting?.drying?.[prd]?.day?.day ??
			input?.factory?.drying?.[prd]?.day?.day,
	)
	if (bType == 'cold') return
	return (
		<div className='data' style={style}>
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
			<Text data={{ value: total }} />
			<Text data={{ value: 'Дни' }} />
		</div>
	)
}
