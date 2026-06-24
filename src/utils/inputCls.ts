const inputCls = (hasError = false): string =>
	`w-full px-4 py-3 text-sm text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border-2 rounded-xl outline-none placeholder:text-brown-300 dark:placeholder:text-brown-400 transition-all duration-150 ${hasError ? 'border-red-400' : 'border-transparent focus:ring-2 focus:ring-brown-300 dark:focus:ring-dark-border'}`;

export default inputCls;
