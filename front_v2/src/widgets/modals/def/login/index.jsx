import { useState } from 'react';
import style from './style.module.css';
import { useReducer } from 'react';
import useEquipStore from '@store/equipment';
import Keyboard from '@src/shared/ui/keyboard';
import useModalStore from '@src/entities/store/modal';
import Button from '@src/shared/ui/button/btn';
import Field from './field';
import onLogin from './control/fn';

//Авторизация
export default function Entry({  closeModal, refDialog }) {
  // Отдельные стейты для каждого поля
  const [form, setForm] = useReducer(reducer, {
    name: '',
    login: '',
    password: '',
  });

  const [activeKeyboard, setActiveKeyboard] = useState(null); // 'login', 'password', или null
  const apiInfo = useEquipStore((s) => s.apiInfo);
  return (
    <div className={style.entry}>
      <h2 className={style.title}>Авторизация</h2>

      <Field
        form={form}
        setForm={setForm}
        show={setActiveKeyboard}
        container={refDialog?.current}
      />

      <div className={style.buttons}>
        <Button
          label="Отмена"
          active={false}
          onClick={() => {
            closeModal();
          }}
          variant="grow"
        />
        <Button
          label="Войти"
          active={true}
          onClick={() => {
            onLogin(form, closeModal);
          }}
          variant="grow"
        />
      </div>

      {apiInfo?.keyboard && activeKeyboard === 'login' && (
        <Keyboard
          value={form.login}
          onChange={(val) => {
            setForm({ type: 'login', val });
            setForm({ type: 'name', val });
          }}
          container={refDialog?.current}
          onClose={hideKeyboard}
          showInput={true}
        />
      )}
    </div>
  );

  function hideKeyboard() {
    setActiveKeyboard(null);
  }
}

/**
 *
 * @param {*} prev Предыдущее состояние
 * @param {*} action Входные данные
 * @returns Текущее состояние
 */
function reducer(prev, action) {
  return { ...prev, [action.type]: action.val };
}
