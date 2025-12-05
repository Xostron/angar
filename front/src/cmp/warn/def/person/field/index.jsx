import Input from '@cmp/fields/input'
import SelectInput from '@src/cmp/warn/def/person/field/choice_input'

//Поля логина и пароля
export default function Field({ 
	form,
	setForm,
	show,
	container
}) {
	return (
		<>
			<SelectInput
				placeholder={'Логин'}
				icon={'/img/login.svg'}
				onClick={()=>show("login")}
				value={form.name}
				setValue={(val) => {
					setForm({ type: 'login', val: val.code ?? val.login })
					setForm({ type: 'name', val: val.name })
				}}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
			/>
			<Input
				id={'password'}
				placeholder={'Пароль'}
				icon={'/img/password.svg'}
				type={'password'}
				value={form.password}
				setValue={(val) => setForm({ type: 'password', val })}
				onClick={()=>show("password")}
				sti={{ textAlign: 'left' }}
				cls='cell-login'
				disabled={'true'}
				max='999999'
				keyboard="numeric"
				keyboardContainer={container}
				showInput={false}

			/>
		</>
	)
}