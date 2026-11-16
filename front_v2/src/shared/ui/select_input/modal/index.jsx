import { useEffect } from 'react';
import style from './style.module.css';

export default function Modal({ show, setShow, list, setValue, value }) {
  useEffect(() => {
    const onClick = (e) => {
      //   console.log(123, e.target.closest);
      //   if (e.target.closest(style.input)) return;
      if (show) setShow(false);
    };
    document.addEventListener('click', onClick);
    return (_) => document.removeEventListener('click', onClick);
  }, []);
  if (!show) return null;

  return (
    <div className={style.modal}>
      {list.map((el, i) => {
        const st =
          value === el.name ? { backgroundColor: 'var(--c-grey-lighter)' } : {};
        return (
          <span
            key={i}
            onClick={() => {
              setValue(el);
              setShow(false);
            }}
            style={st}
          >
            {el.name}
          </span>
        );
      })}
    </div>
  );
}
