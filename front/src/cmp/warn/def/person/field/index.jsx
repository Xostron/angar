import Input from '@cmp/fields/input'

//Поля логина и пароля
export default function Field({ form, setForm }) {
	return (
		<>
			<Input
				placeholder={'Логин'}
				icon={'/img/login.svg'}
				value={form.login}
				setValue={(val) => setForm({ type: 'login', val })}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
				disabled={'true'}
			/>
			<Input
				placeholder={'Пароль'}
				icon={'/img/password.svg'}
				type={'password'}
				value={form.password}
				setValue={(val) => setForm({ type: 'password', val })}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
				disabled={'true'}
			/>
		</>
	)
}
