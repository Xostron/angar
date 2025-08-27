import { useParams } from 'react-router'
import Header from '@src/cmp/header'
import def from './def'
import './style.css'
import Nav from './nav'

function Service({ header = false }) {
	const { type } = useParams()
	const Content = def[type]

	return (
		<>
			{header && <Header />}
			<main className='page-service-main'>
				{Content && <Content />}
				<Nav />
			</main>
		</>
	)
}

export default Service
