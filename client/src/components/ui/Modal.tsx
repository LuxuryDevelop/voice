import type { PropsWithChildren } from "react";

type ModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
}>;

const Modal = ({ open, title, onClose, children }: ModalProps): JSX.Element | null => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass w-full max-w-lg rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-ui text-base text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-[#8A8D96] hover:text-white">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;

