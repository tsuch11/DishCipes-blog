import { useEffect, useRef, useState } from 'react';

// useScrollReveal — trigger fade-in when element enters viewport
// แก้ไขได้: threshold (0.0–1.0), animation class ใน component ที่ใช้งาน
const useScrollReveal = <T extends HTMLElement = HTMLDivElement>() => {
	const ref = useRef<T>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	return { ref, visible };
};

export default useScrollReveal;
