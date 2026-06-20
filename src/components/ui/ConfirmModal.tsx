type ConfirmModalProps = {
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
};

const ConfirmModal = ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }: ConfirmModalProps) => {
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onCancel}>
			<div className="bg-white rounded-2xl px-8 py-8 w-full max-w-sm text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
				<button onClick={onCancel} className="absolute top-4 right-4 text-brown-400 hover:text-brown-600 transition-colors duration-150">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<h2 className="text-xl font-bold text-brown-600 mb-2">{title}</h2>
				<p className="text-sm text-brown-400 mb-6">{message}</p>
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={onCancel}
						className="px-6 py-2.5 text-sm font-medium text-brown-600 border border-brown-400 rounded-full hover:bg-brown-100 transition-colors duration-150"
					>
						{cancelLabel}
					</button>
					<button
						onClick={onConfirm}
						className="px-6 py-2.5 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
