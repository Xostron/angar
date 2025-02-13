import { useEffect, useState } from 'react'
import Control from '../fn/control'
import Field from './field'
import Title from '../fn/title'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import '../style.css'

//Управление вентилятором
export default function Entry({ data = {}, setData, close }) {
	const { _id, name, module, buildingId, sectionId, active } = data
	const { setO, setFan } = useOutputStore()
	const [getFan] = useInputStore(({ getFan }) => [getFan])

	// Состояние вентилятора
	const state = getFan({ _id })?.state ?? null
	// Номер выхода (канала) вентилятора
	const ch = module?.channel - 1
	// Выбранное действие
	const [sel, setSel] = useState(state)
	// При обновлении
	useEffect(() => {
		setSel(state)
	}, [_id])

	return (
		<div className='entry'>
			<Title name={name} />
			<Field sel={sel} change={change} active={active} state={state} />
			<Control cancel={cancel} ok={set} />
		</div>
	)

	// Ок
	function set() {
		const cmd = sel === 'run' ? 1 : 0
		if (sel === 'off' && state !== 'off') setFan({ buildingId, sectionId, fanId: _id, action:sel, value: true })
		else setFan({ buildingId, sectionId, fanId: _id, action:sel, value: false })
		setO({ idB: buildingId, idM: module.id, value: cmd, channel: ch })
		close()
	}
	// Отмена
	function cancel() {
		setData(null)
		close()
	}
	// Переключение радиокнопок
	function change(e) {
		setSel(e.target.value)
	}
}
