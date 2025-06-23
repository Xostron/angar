import { useEffect, useState } from 'react'
import Control from '../fn/control'
import Field from './field'
import Title from '../fn/title'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import '../style.css'

//Управление вентилятором+ПЧ
export default function Entry({ data = {}, setData, close }) {
	const { _id, name, module, buildingId, sectionId, active, ao, sp } = data
	const { setO, setFan } = useOutputStore()
	const [getFan] = useInputStore(({ getFan }) => [getFan])

	// Состояние вентилятора
	const state = getFan({ _id })?.state ?? null
	// Номер выхода (канала) вентилятора
	const ch = module?.channel - 1
	// Выбранное действие
	const [sel, setSel] = useState(state)
	// Задание spO: процент открытия
	const [spO, setSpO] = useState(sp)
	// При обновлении
	useEffect(() => {
		setSel(state)
		setSpO(sp)
	}, [_id])
	console.log(111, ao, sp)
	return (
		<div className='entry'>
			<Title name={name} />
			<Field sel={sel} change={change} active={active} state={state} spO={spO} setSpO={setSpO} />
			<Control cancel={cancel} ok={set} />
		</div>
	)

	// Ок
	function set() {
		const cmd = sel === 'run' ? 1 : 0
		if (sel === 'off' && state !== 'off') setFan({ buildingId, sectionId, fanId: _id, action: sel, value: true })
		else if (sel == 'run') setFan({ buildingId, sectionId, fanId: _id, action: sel, value: false, setpoint: spO })
		else setFan({ buildingId, sectionId, fanId: _id, action: sel, value: false })
		const out = { idB: buildingId, idM: module.id, value: cmd, channel: ch }
		const outAO = { idB: buildingId, idM: ao.id, value: sel == 'run' ? spO : 0, channel: ao.channel - 1 }
		setO(out, outAO)
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
