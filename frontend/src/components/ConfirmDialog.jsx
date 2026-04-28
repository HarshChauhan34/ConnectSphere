function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-neutral-300">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-700"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              danger
                ? "bg-red-600 hover:bg-red-500"
                : "bg-[#0095f6] hover:bg-[#1877f2]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
