import { useState, useEffect } from 'react';

type VT = { finished: Promise<void> };

const useDarkMode = () => {
	const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

	useEffect(() => {
		const root = document.documentElement;
		isDark ? root.classList.add('dark') : root.classList.remove('dark');
	}, []);

	const toggle = () => {
		const next = !isDark;
		const root = document.documentElement;

		const applyChange = () => {
			next ? root.classList.add('dark') : root.classList.remove('dark');
			localStorage.setItem('theme', next ? 'dark' : 'light');
			setIsDark(next);
		};

		const startVT = (document as Document & { startViewTransition?: (cb: () => void) => VT }).startViewTransition;

		if (!startVT) {
			applyChange();
			return;
		}

		root.dataset.themeDir = next ? 'to-dark' : 'to-light';
		const vt = startVT.call(document, applyChange);
		vt.finished.then(() => delete root.dataset.themeDir);
	};

	return { isDark, toggle };
};

export default useDarkMode;
