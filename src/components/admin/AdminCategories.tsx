// ── AdminCategories ───────────────────────────────────────────────────
// Category list with add/delete via Supabase

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import trashIcon from '../../assets/images/icons/Trash_light.svg';

// ── Component ─────────────────────────────────────────────────────────
const AdminCategories = () => {
	const [categories, setCategories] = useState<string[]>([]);
	const [newCategory, setNewCategory] = useState('');

	const fetchCategories = () => {
		supabase.from('categories').select('name').order('name').then(({ data }) => {
			if (data) setCategories(data.map((c) => c.name));
		});
	};

	useEffect(() => { fetchCategories(); }, []);

	const handleAdd = async () => {
		if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
		await supabase.from('categories').insert({ name: newCategory.trim() });
		fetchCategories();
		setNewCategory('');
	};

	const handleDelete = async (cat: string) => {
		await supabase.from('categories').delete().eq('name', cat);
		fetchCategories();
	};

	return (
		<div className="px-4 py-6 md:px-12 md:py-8">
			<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100 mb-6">Category management</h1>
			<hr className="border-stone-200 dark:border-dark-border mb-6" />
			<div className="max-w-sm">
				<div className="bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden mb-4">
					{categories.map((cat, i) => (
						<div key={cat} className={`flex items-center justify-between px-5 py-3.5 ${i < categories.length - 1 ? 'border-b border-stone-100 dark:border-dark-border' : ''}`}>
							<span className="text-sm text-stone-700 dark:text-brown-100">{cat}</span>
							<button onClick={() => handleDelete(cat)} className="hover:opacity-60 transition-opacity duration-150">
								<img src={trashIcon} alt="Delete" className="w-5 h-5" />
							</button>
						</div>
					))}
					{categories.length === 0 && <p className="px-5 py-8 text-sm text-center text-stone-400 dark:text-brown-400">No categories</p>}
				</div>
				<div className="flex gap-2">
					<input
						type="text"
						placeholder="New category"
						value={newCategory}
						onChange={(e) => setNewCategory(e.target.value)}
						onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
						className="flex-1 px-4 py-2.5 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150"
					/>
					<button onClick={handleAdd} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-xl hover:bg-stone-700 transition-colors duration-150">Add</button>
				</div>
			</div>
		</div>
	);
};

export default AdminCategories;
