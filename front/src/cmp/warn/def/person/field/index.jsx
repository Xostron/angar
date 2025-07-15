import Input from "@cmp/fields/input";

//Поля логина и пароля
export default function Field({login, password, setLogin, setPassword}) {
	return (
		<>
			<Input 
				placeholder={"Логин"}
				icon={'/img/login.svg'}
				value={login}
				setValue={setLogin}
				sti={{textAlign: 'left'}}
				cls='cell-login'
				disabled={'true'}
			/>
			<Input
				placeholder={"Пароль"}
				icon={'/img/password.svg'}
				type={'password'}
				value={password}
				setValue={setPassword}
				sti={{textAlign: 'left'}}
				cls='cell-login'
				disabled={'true'}
			/>
		</>
	)
}