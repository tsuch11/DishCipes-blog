// ── Toast ─────────────────────────────────────────────────────────────
// Notification popup (bottom-right) for success and error feedback
// แก้ไขได้: position (bottom-6 right-6), variant colors, animation

type ToastProps = {
	title: string;
	message: string;
	variant?: 'success' | 'error';
	onClose: () => void;
};

const Toast = ({ title, message, variant = 'success', onClose }: ToastProps) => {
	const bg = variant === 'success' ? 'bg-green-500' : 'bg-[#E8545A]';

	return (
		<div className={`fixed bottom-6 right-6 flex items-start gap-3 ${bg} text-white px-5 py-4 rounded-2xl shadow-lg z-50 animate-slideDown`}>
			<div className="flex-1">
				<p className="text-sm font-semibold whitespace-nowrap">{title}</p>
				<p className="text-xs mt-0.5 opacity-90">{message}</p>
			</div>
			<button onClick={onClose} className="shrink-0 mt-0.5 hover:opacity-70 transition-opacity duration-150">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	);
};

export default Toast;
