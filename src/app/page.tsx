'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import Header from '@/components/custom/Header';
import Footer from '@/components/custom/Footer';
import CategoryFilter from '@/components/custom/CategoryFilter';
import useDebounce from '../lib/hooks/useDebounce';

// --- TYPE DEFINITIONS ---
interface User { id: string; username: string; }
interface Category { id:string; name: string; }
interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  category: Category;
  user: User;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

// ArticleCard
const ArticleCard = ({ article }: { article: Article }) => (
  <Link href={`/articles/${article.id}`} className="block">
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative w-full h-48 bg-gray-200">
         {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                style={{ objectFit: 'cover' }}
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
         ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500"><span>No Image</span></div>
         )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-sm text-gray-500 mb-2">{formatDate(article.createdAt)}</p>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex-grow">{article.title}</h3>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{article.category.name}</span>
        </div>
      </div>
    </div>
  </Link>
);

export default function ArticlesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State untuk data dan UI
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // State untuk filter dan search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('categoryId') || null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update query string
  const createQueryString = useCallback((params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }
    return newParams.toString();
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch(`https://test-fe.mysellerpintar.com/api/categories`, { cache: 'no-store' });
        const categoriesData = await res.json();
        setCategories(categoriesData.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      const currentParams = new URLSearchParams();
      if (debouncedSearchTerm) currentParams.set('search', debouncedSearchTerm);
      if (selectedCategory) currentParams.set('categoryId', selectedCategory);
      try {
        const res = await fetch(`https://test-fe.mysellerpintar.com/api/articles?${currentParams.toString()}`, { cache: 'no-store' });
        const articlesData = await res.json();
        setArticles(articlesData.data || []);
        setMeta({
          total: articlesData.meta?.total || 0,
          last_page: articlesData.meta?.last_page || 1
        });
      } catch (error) {
        console.error("Failed to fetch articles", error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [debouncedSearchTerm, selectedCategory]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    // Reset page to 1 when filter/search changes
    router.push(`${pathname}?${createQueryString({
      search: debouncedSearchTerm || null,
      categoryId: selectedCategory || null,
      page: '1',
    })}`);
  }, [debouncedSearchTerm, selectedCategory, createQueryString, pathname, router]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative text-white text-center py-20 px-4 bg-cover bg-center flex items-center justify-center min-h-[360px]"
          style={{ backgroundImage: "url('/banner.jpg')" }}
        >
          <div className="absolute inset-0 bg-blue-700 opacity-80"></div>
          <div className="relative z-10 w-full max-w-3xl mx-auto">
            <p className="font-semibold text-sm mb-2">Blog genzet</p>
            <h1 className="text-4xl md:text-5xl font-bold max-w-4xl mx-auto leading-tight">
              The Journal : Design Resources, Interviews, and Industry News
            </h1>
            <p className="mt-4 text-lg text-blue-200">Your daily dose of design insights!</p>
            <div className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-lg shadow-lg">
              <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} value={selectedCategory} />
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search articles"
                  className="w-full h-full px-4 py-2 rounded-md text-gray-800 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600 mb-6">Showing: {articles.length} of {meta.total} articles</p>
          {isLoading ? (
            <div className="text-center py-12">Loading articles...</div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">No Articles Found</h2>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter.</p>
            </div>
          )}
          {/* Pagination can be implemented here */}
        </section>
      </main>
      <Footer />
    </div>
  );
}