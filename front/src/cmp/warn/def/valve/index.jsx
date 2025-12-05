import { useState, useEffect } from 'react'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import Control from '../fn/control'
import Field from '../valve/field'
import Title from '../fn/title'
import '../style.css'

//Управление клапаном
export default function Entry({ data = {}, entryCode, refDialog }) {
	const { vlv, state, build, refSp, sp } = data
	const setO = useOutputStore((s) => s.setO)
	const setT = useOutputStore((s) => s.setT)
	const setTune = useOutputStore((s) => s.setTune)
	const sendTune = useOutputStore((s) => s.sendTune)
	const clear = useWarn((s) => s.clear)
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
			<Field sel={sel} change={change} spO={spO} setSpO={setSpO} container={refDialog?.current} />
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
			off = { idB: build, idM: vlv.module.off.id, value: 0, channel: chOff, sel }
			cmd = { idB: build, idM: vlv.module.on.id, value: 0, channel: chOn, sel }
		}
		if (sel === 'iopn') {
			off = { idB: build, idM: vlv.module.off.id, value: 0, channel: chOff, sel }
			cmd = { idB: build, idM: vlv.module.on.id, value: 1, channel: chOn, sel }
		}
		if (sel === 'icls') {
			cmd = { idB: build, idM: vlv.module.off.id, value: 1, channel: chOff, sel }
			off = { idB: build, idM: vlv.module.on.id, value: 0, channel: chOn, sel }
		}
		if (sel === 'popn') {
			if (spO > sp) {
				cmd = {
					idB: build,
					idM: vlv.module.off.id,
					value: 0,
					channel: chOff,
					sel,
					setpoint: spO,
				}
				tCmd = {
					idB: build,
					idM: vlv.module.on.id,
					value: 1,
					channel: chOn,
					time: timeSP,
					_id: vlv._id,
					type: 'on',
					sel,
				}
			}
			if (spO < sp) {
				cmd = {
					idB: build,
					idM: vlv.module.on.id,
					value: 0,
					channel: chOn,
					sel,
					setpoint: spO,
				}
				tCmd = {
					idB: build,
					idM: vlv.module.off.id,
					value: 1,
					channel: chOff,
					time: timeSP,
					_id: vlv._id,
					type: 'off',
					sel,
				}
			}
		}

		if (cmd) setO(cmd, off, 'valve', vlv._id)
		if (tCmd) setT(tCmd)
		sendTune()
		clear()
	}
	// Отмена
	function cancel() {
		clear()
	}
	// Переключение радиокнопок
	function change(e) {
		setSel(e.target.value)
	}
}
