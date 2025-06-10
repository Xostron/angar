import axios from 'axios'
import './style.css'
import useSocketStore from '@store/socket'
import useSocket from '@socket/useSocket'
import { useEffect, useRef } from 'react'
import { socket } from '@socket/index'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import useOutputStore from '@store/output'

import { useShallow } from 'zustand/react/shallow'

const Main = () => {
	const r = useRef()
	// useSocket()
	// const {initE} = useEquipStore()
	// const { on } = useSocketStore(({ on }) => ({ on }))
	const input = useInputStore(useShallow(({ input }) => input))
	// const output = useOutputStore(({ output }) => output)
	// const equip = useEquipStore(({ list }) => list)
	return (
		<div className='content'>
			<h1>AngarWEB Test</h1>
			{/* <p>Socket status: {on ? 'вкл' : 'выкл'}</p> */}
			<p>
				<button style={{ width: 80, height: 40 }} onClick={click}>
					HTTP API
				</button>
			</p>

			<p>
				<input ref={r} />
				<button style={{ width: 80, height: 40 }} onClick={clickWS}>
					Socket
				</button>
				<button style={{ width: 80, height: 40 }} onClick={() => {}}>
					Equipment
				</button>
			</p>
			<p>
				<button style={{ width: 80, height: 40 }} onClick={clickOnOff}>
					Socket on|off
				</button>
			</p>
		</div>
	)

	function clickOnOff() {
		if (socket.connected) return socket.disconnect()
		socket.connect()
	}
	function clickWS() {
		// Можно отправлять любое количество аргументов и любые сериализуемые структуры данных,
		// включая буферы и типизированные массивы.
		// Сериализация объектов (JSON.stringify()) выполняется автоматически.
		// Map и Set должны быть сериализованы вручную.

		// Отправка произвольных данных из инпута по реф
		socket.emit('hello', r.current.value, (res) => console.log('hello', res))
		/** Отправка произвольных данных
		const obj = {
			a: [1,2,3,4],
			s: 'sdfdfiikj',
			f: 32432.99
		}
		socket.emit("hello", obj, (...args) => {
			if(args) console.log("hello", args); // Ответ от сервера
		});
		*/

		/** Отправка бинарных данных
		socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6, 7, 8]) }, (r)=>{
			console.log('"with-binary"', response); // "got it"
		});
		*/
	}
}

/**
 * HTTP запрос к локальному api сервера
 */
function click() {
	const uri = `${process.env.PUBLIC_LOCAL_API}test`
	axios
		.get(uri)
		.then((r) => {
			if (!r.data) return alert('Пустой ответ')
			console.log(JSON.stringify(r?.data))
			alert(`Данные получены: ${JSON.stringify(r?.data, null, 2)}`)
		})
		.catch((error) => {
			console.log(error)
			alert(`Ошибка! ${error.toString()}`)
		})
}
export default Main
