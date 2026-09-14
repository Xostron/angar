import React, { useEffect, useRef } from 'react';
import './style.css';

export default function BaseDialog({ isOpen, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;
    console.log(1234, isOpen);
    if (isOpen) {
      // Открывает окно поверх всего как модалку (появляется встроенный ::backdrop)
      if (!dialogNode.open) dialogNode.showModal();
    } else {
      if (dialogNode.open) dialogNode.close();
    }
  }, [isOpen]);

  // Обрабатываем закрытие, если пользователь нажал Esc (браузер сам вызывает событие cancel)
  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  // Закрытие при клике на оверлей (backdrop)
  const close = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={close}
      className="base-dialog"
    >
      <img
        width="24px"
        height="24px"
        className="dialog-close-btn"
        onClick={onClose}
        src="/icon/indicator/cross.svg"
      />
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
