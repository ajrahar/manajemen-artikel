'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import useDebounce from '@/lib/hooks/useDebounce';

// Tipe data
interface Category {
  id: string;
  name: string;
}
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

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      return newParams.toString();
    },
    [searchParams]
  );

  // Fetch kategori
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://test-fe.mysellerpintar.com/api/categories', { cache: 'no-store' });
        const data = await res.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch artikel
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) params.set('search', debouncedSearch);
      else params.delete('search');

      try {
        const res = await fetch(`https://test-fe.mysellerpintar.com/api/articles?${params.toString()}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        setArticles(data.data || []);
        setMeta(data.meta || { total: 0, last_page: 1, current_page: 1 });
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [searchParams, debouncedSearch]);

  const handleDelete = async (articleId: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await fetch(`https://test-fe.mysellerpintar.com/api/articles/${articleId}`, {
          method: 'DELETE',
          cache: 'no-store',
        });
        // Refresh halaman setelah hapus
        router.refresh();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete article.');
      }
    }
  };

  const handleFilterChange = (type: 'search' | 'category' | 'page', value: string | null) => {
    let query;
    if (type === 'page') {
      query = { page: value };
    } else {
      const key = type === 'search' ? 'search' : 'categoryId';
      query = { [key]: value, page: '1' };
    }
    router.push(`${pathname}?${createQueryString(query)}`);
  };

  // Effect untuk sync debounced search dengan URL
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      handleFilterChange('search', debouncedSearch);
    }
  }, [debouncedSearch, searchParams, pathname, router, createQueryString]);

  // --- Logout Handler ---
  const handleLogout = () => {
    // Clear auth state (e.g., remove token from localStorage)
    localStorage.removeItem('authToken'); // adjust based on how you store auth
    // Redirect to login
    router.push('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <Link
            href="/admin/articles"
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-gray-100 transition ${
              pathname === '/admin/articles' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Articles
          </Link>

          <Link
            href="/admin/categories"
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-gray-100 transition ${
              pathname === '/admin/categories' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 12h.01M7 17h.01M12 7h.01M12 12h.01M12 17h.01M17 7h.01M17 12h.01M17 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Categories
          </Link>
        </nav>

        <div className="absolute bottom-6 w-64 px-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
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
            <Link
              href="/admin/articles/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Article
            </Link>
          </div>

          <p className="text-sm text-gray-500 mb-4">Total Articles: {meta.total}</p>

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
                  <tr>
                    <td colSpan={5} className="text-center py-10">
                      Loading...
                    </td>
                  </tr>
                ) : articles.length > 0 ? (
                  articles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-6 py-4">
                        <div className="w-16 h-10 rounded bg-gray-200 relative">
                          {article.imageUrl && (
                            <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} className="rounded" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                      <td className="px-6 py-4 text-gray-500">{article.category.name}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(article.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        <Link href={`/articles/${article.id}`} target="_blank" className="text-blue-600 hover:text-blue-900 mr-4">
                          Preview
                        </Link>
                        <Link href={`/admin/articles/edit/${article.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10">
                      No articles found.
                    </td>
                  </tr>
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
      </main>
    </div>
  );
}