type FormFieldProps = {
	label: string;
	error?: string;
	labelCls?: string;
	children: React.ReactNode;
};

const FormField = ({ label, error, labelCls = 'text-sm text-brown-500 dark:text-brown-300', children }: FormFieldProps) => (
	<div className="flex flex-col gap-1.5">
		<label className={labelCls}>{label}</label>
		{children}
		{error && <p className="text-xs text-red-500">{error}</p>}
	</div>
);

export default FormField;
