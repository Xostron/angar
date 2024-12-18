import { useState, useEffect } from 'react'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import Control from '../fn/control'
import Field from '../valve/field'
import Title from '../fn/title'
import '../style.css'

//Управление клапаном
export default function Entry({ data = {}, setData, close }) {
	const { vlv, state, build, refSp, sp } = data
	const { setO, setT, setTune, sendTune } = useOutputStore()

	// Текущее значение выходов
	const chOn = vlv?.module?.on?.channel - 1
	const chOff = vlv?.module?.off?.channel - 1
	// Выбранное действие - радиокнопки
	const [sel, setSel] = useState(state)
	// Задание spO: процент открытия
	const [spO, setSpO] = useState(sp)
	const timeSP = refSp ? ((spO * refSp) / 100).toFixed() : null

	const t = vlv?.type === 'in' ? 'Приточный клапан' : 'Выпускной клапан'
	// При обновлении
	useEffect(() => {
		setSel(state)
		setSpO(sp)
	}, [data, sp])

	return (
		<div className='entry'>
			<Title name={t} />
			<Field sel={sel} change={change} spO={spO} setSpO={setSpO} />
			<Control cancel={cancel} ok={set} />
		</div>
	)

	// Ok - Записать в стор команду управления
	function set() {
		let cmd = null
		let off = null
		let tCmd = null

		if (sel === 'tune') setTune({ ...vlv, _stage: 'begin', _build: build })
		else setTune({ ...vlv, _stage: null })
		if (sel === 'stop') {
			off = { idB: build, idM: vlv.module.off.id, value: 0, channel: chOff }
			cmd = { idB: build, idM: vlv.module.on.id, value: 0, channel: chOn }
		}
		if (sel === 'iopn') {
			off = { idB: build, idM: vlv.module.off.id, value: 0, channel: chOff }
			cmd = { idB: build, idM: vlv.module.on.id, value: 1, channel: chOn }
		}
		if (sel === 'icls') {
			cmd = { idB: build, idM: vlv.module.off.id, value: 1, channel: chOff }
			off = { idB: build, idM: vlv.module.on.id, value: 0, channel: chOn }
		}
		if (sel === 'popn') {
			if (spO > sp) {
				cmd = { idB: build, idM: vlv.module.off.id, value: 0, channel: chOff }
				tCmd = {
					idB: build,
					idM: vlv.module.on.id,
					value: 1,
					channel: chOn,
					time: timeSP,
					_id: vlv._id,
					type: 'on',
				}
			}
			if (spO < sp) {
				cmd = { idB: build, idM: vlv.module.on.id, value: 0, channel: chOn }
				tCmd = {
					idB: build,
					idM: vlv.module.off.id,
					value: 1,
					channel: chOff,
					time: timeSP,
					_id: vlv._id,
					type: 'off',
				}
			}
		}

		if (cmd) setO(cmd, off)
		if (tCmd) setT(tCmd)
		sendTune()
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
