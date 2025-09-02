import Input from '@cmp/fields/input'
import SelectInput from '@src/cmp/warn/def/person/field/choice_input'

//Поля логина и пароля
export default function Field({ form, setForm }) {
	return (
		<>
			<SelectInput
				placeholder={'Логин'}
				icon={'/img/login.svg'}
				value={form.name}
				setValue={(val) => {
					setForm({ type: 'login', val: val.code ?? val.login })
					setForm({ type: 'name', val: val.name })
				}}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
			/>
			{/* <Input
				placeholder={'Логин'}
				icon={'/img/login.svg'}
				value={form.login}
				setValue={(val) => setForm({ type: 'login', val })}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
				disabled={'true'}
			/> */}
			<Input
				placeholder={'Пароль'}
				icon={'/img/password.svg'}
				type={'password'}
				value={form.password}
				setValue={(val) => setForm({ type: 'password', val })}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
				disabled={'true'}
				max='999999'
			/>
		</>
	)
}
