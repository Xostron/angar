
import Logo from '@cmp/header/logo'
import Control from './control'
import Field from './field'
import useEntry from './use'
//Аваторизация
export default function Entry({show, setShow}) {
	const {login, password, setLogin, setPassword} = useEntry(show, setShow)
	if (!show) return null
	return (
		<div className="curt" >
			<dialog className="entry">
				<Logo />
				<Field 
					login={login}
					password={password}
					setLogin={setLogin}
					setPassword={setPassword}
				/>
				<Control
					login={login}
					password={password}
					setShow={setShow}
				/>
			</dialog>
		</div>
	)
}	