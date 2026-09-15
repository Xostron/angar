import React, { useEffect, useRef } from 'react';
import style from './style.module.css';

export default function BaseDialog({ isOpen, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const cur = ref.current;
    if (!cur) return;
    if (isOpen) {
      // Открывает окно поверх всего как модалку (появляется встроенный ::backdrop)
      if (!cur.open) cur.showModal();
    } else {
      if (cur.open) cur.close();
    }
  }, [isOpen]);

  // Закрытие по Esc (браузер сам вызывает событие cancel)
  const esc = (e) => {
    e.preventDefault();
    onClose();
  };

  // Закрытие при клике на оверлей (backdrop)
  const close = (e) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onCancel={esc}
      onClick={close}
      className={style.container}
    >
      <img
        width="24px"
        height="24px"
        className={style.btn}
        onClick={onClose}
        src="/icon/indicator/cross.svg"
      />
      <div className={style.content}>{children}</div>
    </dialog>
  );
}
