import { useState } from 'react'
import './style.css'

function Accordion({ title, children, defaultOpen = false }) {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	const toggleAccordion = () => {
		setIsOpen(!isOpen)
	}

	return (
		<div className="accordion">
			<div 
				className="accordion-header" 
				onClick={toggleAccordion}
			>
				<span className="accordion-title">{title}</span>
				<span className={`accordion-arrow ${isOpen ? 'open' : ''}`}>
					▼
				</span>
			</div>
			<div className={`accordion-content ${isOpen ? 'open' : ''}`}>
				<div className="accordion-body">
					{children}
				</div>
			</div>
		</div>
	)
}

export default Accordion
