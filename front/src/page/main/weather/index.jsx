import useViewStore from '@store/view'
import useEquipStore from '@store/equipment'
import { useShallow } from 'zustand/react/shallow'
import Region from './region'
import './style.css'

export default function Weather({ data }) {
	const mb = useViewStore((s) => s.mb())
	const [list] = useEquipStore(useShallow(({ list }) => [list]))
	const cls = ['main-weather', mb].join(' ')
	const clsL = ['mw-left', mb].join(' ')
	const clsR = ['mw-right', mb].join(' ')
	if(!list || !list.length) return
	return (
		<section className={cls}>
			<div className={clsL}>
				<Region data={data} />
			</div>
			<div className={clsR}></div>
		</section>
	)
}
