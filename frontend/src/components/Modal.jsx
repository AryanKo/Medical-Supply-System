export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHeader">
          <strong>{title}</strong>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modalBody">{children}</div>
        {footer ? <div className="modalBody" style={{ paddingTop: 0 }}>{footer}</div> : null}
      </div>
    </div>
  );
}

