import InputNum from '@src/shared/ui/input';
import SelectInput from './select_input';

//Поля логина и пароля
export default function Field({ form, setForm, show, container }) {
  return (
    <>
      <SelectInput
        placeholder={'Логин'}
        icon={'/icon/indicator/login.svg'}
        onClick={() => show('login')}
        value={form.name}
        setValue={(val) => {
          setForm({ type: 'login', val: val.code ?? val.login });
          setForm({ type: 'name', val: val.name });
        }}
    
      />
      <InputNum
        id={'password'}
        placeholder={'Пароль'}
        icon={'/icon/indicator/password.svg'}
        type={'password'}
        value={form.password}
        setValue={(val) => setForm({ type: 'password', val })}
        size=""
        unit=""
		max={999999}
        // onClick={()=>show("password")}
        // sti={{ textAlign: 'left' }}
        // cls='cell-login'
        // disabled={'true'}
        // max='999999'
        // keyboard="numeric"
        // keyboardContainer={container}
        // showInput={false}
      />
    </>
  );
}
