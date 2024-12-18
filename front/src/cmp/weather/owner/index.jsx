import './style.css'

export default function Owner({ data = {}, cls }) {
	const { company, code, address } = data
	let cl = ['w-owner', cls]
	cl = cl.join(' ')
	return (
		<div className={cl}>
			<div className='w-owner-head'>
				<img src='/img/geo.svg' />
				<span>
					{company.name}
					<p>{code}</p>
				</span>
			</div>
			<span>{address || ''}</span>
		</div>
	)
}
