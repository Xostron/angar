import Helmet from 'react-helmet'
import useEquipStore from '@store/equipment'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { get } from '@tool/api/service'
import StatusWS from './status_ws'
import useViewStore from '@src/store/view'
import {uri} from '@store/uri'

function Version() {
	const [title, setTitle] = useState('')
	const mb = useViewStore((s) => s.mb())
	const list = useEquipStore(useShallow(({ list }) => list))
	const apiInfo = useEquipStore((s) => s.apiInfo)
	const [info, setInfo] = useState()
	const { name, code } = list?.[0]?.company ?? {}

	useEffect(() => {
		if (name && code) setTitle(`${code} ${name} `)
	}, [name, code])

	// Запрос у ангар-сервера mac ethernet
	useEffect(() => {
		get('net_info', uri)
			.then((o) => {
				setInfo(o.net)
			})
			.catch((e) => {
				setInfo(null)
				console.log(e)
			})
	}, [])
	console.log('apiInfo', apiInfo)
	const VERSION = process.env.VERSION
	// const NAME = process.env.NAME
	// Версия front, URL сервера
	const V = !mb && `V${VERSION}, url: ${uri}`
	// Информация о сети
	const nn = info?.map((el) => `${el.interface}: ${el.ip || el.mac}`).join(' ')
	const N = !mb && nn && ` Сеть: ${nn}`

	return (
		<div style={stl}>
			<Helmet title={title} />
			{!mb && <StatusWS />}
			{apiInfo.battery && apiInfo.battery < 100 && <span>Батарея: {apiInfo.battery}%</span>}
			{V}
			{N}
		</div>
	)
}
export default Version

const stl = {
	display: 'flex',
	alignItems: 'center',
	gap: '.3em',
	position: 'absolute',
	bottom: '15px',
	right: '15px',
	color: 'darkgray',
}
