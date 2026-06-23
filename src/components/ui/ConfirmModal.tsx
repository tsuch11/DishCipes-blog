// ConfirmModal — modal ยืนยันก่อน action สำคัญ (delete, reset password)
// แก้ไขได้: backdrop opacity (bg-black/40), card max-width (max-w-sm),
//           button styles (cancel/confirm), close button icon

import closeIcon from '../../assets/images/icons/Close_round_light.svg';

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
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 animate-fadeIn" onClick={onCancel}>
			<div className="relative bg-white dark:bg-dark-surface rounded-2xl px-10 py-10 w-full max-w-sm text-center shadow-xl dark:shadow-black/40 animate-fadeInUp" onClick={(e) => e.stopPropagation()}>
				<button onClick={onCancel} className="absolute top-4 right-4 hover:opacity-60 transition-opacity duration-150">
					<img src={closeIcon} alt="Close" className="w-5 h-5" />
				</button>
				<h2 className="text-xl font-medium text-brown-600 dark:text-brown-100 mb-6">{title}</h2>
				<p className="text-xs text-brown-400 dark:text-brown-300 mb-6">{message}</p>
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={onCancel}
						className="px-6 py-2.5 text-sm font-medium text-brown-600 dark:text-brown-100 border border-brown-400 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-elevated transition-colors duration-150"
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
