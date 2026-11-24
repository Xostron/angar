import { useEffect, useState } from 'react';
import Modal from './modal';
import style from './style.module.css';

//Поле ввода
export default function Select({ value, setValue, stl, icon, cls, list = [] }) {
  const [val, setVal] = useState(value);
  const [show, setShow] = useState(false);

  let cl = [style.container, cls];
  cl = cl.join(' ');

  return (
    <div style={{ ...stl }} className={cl}>
      <img width="36" src={`/icon/product/${val?.code ?? 'potato'}.svg`} />
      <span className={style.text}>{val?.name ?? val}</span>
      <img
        onClick={toggleModal}
        className={style.arrow}
        src="/icon/indicator/chevronDown.svg"
        alt=""
      />
      <Modal
        value={value}
        setValue={(p) => {
          setVal(p);
          setValue(p);
        }}
        list={list}
        show={show}
        setShow={setShow}
      />
    </div>
  );

  function toggleModal(e) {
    setShow(!show);
  }
}
