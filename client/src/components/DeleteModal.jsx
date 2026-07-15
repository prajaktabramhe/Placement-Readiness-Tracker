const DeleteModal = ({
  isOpen,
  companyName,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        <div className="text-center">

          <div className="text-6xl mb-4">
            🗑️
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            Delete Company
          </h2>

          <p className="text-gray-600 mt-4">
            Are you sure you want to delete
          </p>

          <p className="text-xl font-bold text-red-600 mt-2">
            {companyName}?
          </p>

          <p className="text-sm text-gray-400 mt-3">
            This action cannot be undone.
          </p>

        </div>

        <div className="flex justify-center gap-4 mt-8">

          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
};

export default DeleteModal;
