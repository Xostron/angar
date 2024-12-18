import IconText from '@cmp/fields/icon_text'
import Switch from '@cmp/fields/switch'
import Text from '@cmp/fields/text'

export default function Data({  }) {
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
			<Switch data={{ value: true }} />
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
					value: 12,
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
			<Text data={{ value: 12 }} />
			<Text data={{ value: 'Дни' }} />
		</div>
	)
}
