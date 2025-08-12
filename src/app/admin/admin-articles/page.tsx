'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import useDebounce from '@/lib/hooks/useDebounce';

// Tipe data
interface Category { id: string; name: string; }
interface Article {
  id: string;
  title: string;
  imageUrl: string | null;
  createdAt: string;
  category: Category;
}
interface Meta {
    total: number;
    last_page: number;
    current_page: number;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminArticlesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, last_page: 1, current_page: 1 });
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Fungsi untuk membuat atau memperbarui query string di URL
    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(params)) {
                if (value === null || value === '') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            }
            return newParams.toString();
        },
        [searchParams]
    );

    // Fetch kategori saat komponen pertama kali dimuat
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`https://test-fe.mysellerpintar.com/api/categories`, { cache: 'no-store' });
                const data = await res.json();
                setCategories(data.data || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch artikel setiap kali parameter URL (termasuk debouncedSearch) berubah
    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            const params = new URLSearchParams(searchParams.toString());
            
            if (debouncedSearch) {
                params.set('search', debouncedSearch);
            } else {
                params.delete('search');
            }

            try {
                const res = await fetch(`https://test-fe.mysellerpintar.com/api/articles?${params.toString()}`, { cache: 'no-store' });
                const data = await res.json();
                setArticles(data.data || []);
                setMeta(data.meta || { total: 0, last_page: 1, current_page: 1 });
            } catch (error) {
                console.error("Failed to fetch articles:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [searchParams, debouncedSearch]);
    
    const handleDelete = async (articleId: string) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            console.log(`Deleting article ${articleId}`);
            // Tambahkan logika delete dengan axios dan re-fetch data
        }
    };

    // FIX: Update function to handle 'page' type
    const handleFilterChange = (type: 'search' | 'category' | 'page', value: string | null) => {
        let query;
        if (type === 'page') {
            // For page changes, we only update the page param
            query = { page: value };
        } else {
            // For other filters, we reset to page 1
            const key = type === 'search' ? 'search' : 'categoryId';
            query = { [key]: value, page: '1' };
        }
        router.push(`${pathname}?${createQueryString(query)}`);
    };

    // Effect to handle debounced search term changes
    useEffect(() => {
        // This effect ensures that we only navigate when the debounced term changes,
        // and not on every keystroke.
        const currentSearch = searchParams.get('search') || '';
        if (debouncedSearch !== currentSearch) {
            handleFilterChange('search', debouncedSearch);
        }
    }, [debouncedSearch, searchParams, pathname, router]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6">Articles</h1>

            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <select 
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        value={searchParams.get('categoryId') || ''}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by title"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm w-64"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <Link href="/admin/articles/create" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} />
                    Add Articles
                </Link>
            </div>

            <p className="text-sm text-gray-500 mb-4">Total Articles : {meta.total}</p>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">Thumbnails</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">Created at</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center py-10">Loading...</td></tr>
                        ) : articles.length > 0 ? (
                            articles.map((article) => (
                                <tr key={article.id}>
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-10 rounded bg-gray-200 relative">
                                        {article.imageUrl && <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} className="rounded" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                                    <td className="px-6 py-4 text-gray-500">{article.category.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{formatDate(article.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                        <Link href={`/articles/${article.id}`} target="_blank" className="text-blue-600 hover:text-blue-900 mr-4">Preview</Link>
                                        <Link href={`/admin/articles/edit/${article.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                        <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center py-10">No articles found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 text-sm">
                <button 
                    onClick={() => handleFilterChange('page', (meta.current_page - 1).toString())}
                    disabled={meta.current_page <= 1}
                    className="flex items-center gap-1 px-3 py-1 border rounded-md disabled:opacity-50"
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                <span>Page {meta.current_page} of {meta.last_page}</span>
                <button 
                    onClick={() => handleFilterChange('page', (meta.current_page + 1).toString())}
                    disabled={meta.current_page >= meta.last_page}
                    className="flex items-center gap-1 px-3 py-1 border rounded-md disabled:opacity-50"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
