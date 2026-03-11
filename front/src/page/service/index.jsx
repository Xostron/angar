import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '@src/cmp/header'
import def from './def'
import './style.css'
import Nav from './nav'
import RadioIp from './radio_ip'
import useServiceStore from '@store/service'
import { uri } from '@store/uri'

function Service({ header = false }) {
	const { type } = useParams()
	const fetchNetInfo = useServiceStore((s) => s.fetchNetInfo)
	const Content = def[type]

	useEffect(() => {
		fetchNetInfo(uri)
	}, [])

	return (
		<>
			{header && <Header />}
			<main className='page-service-main'>
				<section className='page-service'>
					{type !== 'journal' && <RadioIp />}
					{Content ? (
						<Content />
					) : (
						<div style={{ padding: '20px', textAlign: 'center' }}>
							<span style={{ fontSize: '18px', color: '#888' }}>
								Раздел не найден
							</span>
						</div>
					)}
				</section>
				<Nav />
			</main>
		</>
	)
}

export default Service
