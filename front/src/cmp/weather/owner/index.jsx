import './style.css'

export default function Owner({ data = {}, cls }) {
	const { company, code } = data
	let cl = ['w-owner', cls]
	cl = cl.join(' ')
	return (
		<div className={cl}>
			<div className='w-owner-head'>
				<span> {code} </span>
			</div>
			<span>{company.name}</span>
		</div>
	)
}
