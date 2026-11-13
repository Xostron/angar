import { useState } from 'react';
// import Control from './control';
// import Field from './field';
import style from './style.module.css';
import { useReducer } from 'react';
import useEquipStore from '@store/equipment';
import Keyboard from '@src/shared/ui/keyboard';
import useModalStore from '@src/entities/store/modal';
import Button from '@src/shared/ui/button/btn';
import Field from './field'

//Авторизация
export default function Entry({ data, entryCode, refDialog }) {
  //   Закрыть модальное окно
  const closeModal = useModalStore((s) => s.close);

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
      {/* <Control form={form} /> */}

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
            setStart({ _id: idB, val: true });
            closeModal(false);
          }}
          variant="grow"
        />
      </div>

      {apiInfo?.keyboard && activeKeyboard === 'login' && (
        <Keyboard
          value={form.login}
          onChange={(val) => {
            console.log();
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
