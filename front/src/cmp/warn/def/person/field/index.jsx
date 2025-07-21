import Input from '@cmp/fields/input'

//Поля логина и пароля
export default function Field({ form, dispatch }) {
	return (
		<>
			<Input
				placeholder={'Логин'}
				icon={'/img/login.svg'}
				value={form.login}
				setValue={(val) => dispatch({ type: 'login', val })}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
				disabled={'true'}
			/>
			<Input
				placeholder={'Пароль'}
				icon={'/img/password.svg'}
				type={'password'}
				value={form.password}
				setValue={(val) => dispatch({ type: 'password', val })}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
				disabled={'true'}
			/>
		</>
	)
}
