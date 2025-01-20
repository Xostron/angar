import useInputStore from '@store/input'
import IconText from '@cmp/fields/icon_text'
import Text from '@cmp/fields/text'
import fnList from './fn'
import { Fragment, useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

// Список датчиков: сеть
export default function Pui({ data }) {
	const [input] = useInputStore(useShallow(({ input }) => [input]))
	//Получить линии показаний
	const r = useMemo(() => fnList(data, input), [input])

	let cl = ['cell-w']
	cl = cl.join(' ')
	const listSen = { gridTemplateColumns: '70% repeat(2, 1fr)', gridTemplateRows: `repeat(${r.length}, var(--fsz65))` }
	return (
		<section className='list-sen' style={listSen}>
			{r.map((el, i) =>
				el?.type === 'text' ? (
					<span key={i} className={'title'} style={{ gridArea: `${1 + i}/1/${2 + i}/4` }}>
						{el.name}
					</span>
				) : (
					<Fragment key={i}>
						<IconText cls={cl} data={{ value: el.name, icon: el.icon }} />
						<Text cls={cl} data={{ value: el.value }} />
						<Text cls={cl} data={{ value: el.unit }} />
					</Fragment>
				)
			)}
		</section>
	)
}
