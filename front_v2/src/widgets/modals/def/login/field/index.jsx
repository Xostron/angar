import InputPsw from '@src/shared/ui/input_psw';
import InputSelect from '@src/shared/ui/select_input';
import style from './style.module.css';

//Поля логина и пароля
export default function Field({ form, setForm, show, container }) {
  return (
    <div className={style.container}>
      <InputSelect
        placeholder={'Логин'}
        icon={'/icon/indicator/user.svg'}
        onClick={() => show('login')}
        value={form.name}
        setValue={(val) => {
          setForm({ type: 'login', val: val.code ?? val.login });
          setForm({ type: 'name', val: val.name });
        }}
      />
      <InputPsw
        id={'password'}
        placeholder={'Пароль'}
        value={form.password}
        setValue={(val) => setForm({ type: 'password', val })}
        onClick={() => show('password')}
        keyboardContainer={container}
        showInput={false}
      />
    </div>
  );
}
