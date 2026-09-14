import { X } from "lucide-react";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
  className="icon-button"
  type="button"
  onClick={onClose}
  aria-label="Close dialog"
>
  <X size={18} strokeWidth={1.8} />
</button>
        </div>
        {children}
      </section>
    </div>
  )
}
