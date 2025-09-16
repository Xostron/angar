import './style.css'

export default function Owner({ data = {}, cls }) {
	const { company, code, name } = data
	const cl = [cls].join(' ')
	return (
		<div className={cl}>
			<span>
				{code}
				<br />
				{name}
			</span>
			<span>{company.name}</span>
		</div>
	)
}
