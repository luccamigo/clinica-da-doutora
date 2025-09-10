// Modal genérico: fecha no ESC, bloqueia scroll do body e possui áreas de header/body/footer
import React, { useEffect } from 'react';
import styles from './Modal.module.scss';

const Modal = ({ open, title, children, footer, onClose, width = '36rem' }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    if (open) {
      document.addEventListener('keydown', onKey);
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = original;
      };
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.root} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.dialog} style={{ maxWidth: width }}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={`${styles.close} btn-close`} onClick={onClose} aria-label="Fechar"></button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
