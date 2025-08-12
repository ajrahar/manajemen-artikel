import { Search } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/custom/Header'; // Assuming Header is now in its own file
import Footer from '@/components/custom/Footer'; // Assuming Footer is now in its own file
import CategoryFilter from '@/components/custom/CategoryFilter';


// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  username: string;
}
interface Category {
  id: string;
  name: string;
}
interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  category: Category;
  user: User;
}
interface ArticlesApiResponse {
  data: Article[];
  meta: { total: number; per_page: number; current_page: number; last_page: number; };
}
// NEW: Interface for categories API response
interface CategoriesApiResponse {
    data: Category[];
}


// --- DATA FETCHING FUNCTIONS ---
async function getArticles(page: number = 1, limit: number = 9): Promise<ArticlesApiResponse> {
  // ... (this function remains the same)
  try {
    const res = await fetch(`https://test-fe.mysellerpintar.com/api/articles?page=${page}&limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  } catch (error) {
    console.error(error);
    return { data: [], meta: { total: 0, per_page: 9, current_page: 1, last_page: 1 } };
  }
}

// NEW: Function to fetch categories
async function getCategories(): Promise<CategoriesApiResponse> {
    try {
        const response = await fetch(`https://test-fe.mysellerpintar.com/api/categories`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return { data: [] };
    }
}

// --- HELPER & CHILD COMPONENTS ---
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const ArticleCard = ({ article }: { article: Article }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
    <div className="relative w-full h-48 bg-gray-200">
       {article.imageUrl ? (
            <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} />
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
);


// --- MAIN PAGE COMPONENT ---
export default async function ArticlesPage() {
  // Fetch articles and categories in parallel for better performance
  const [articlesResponse, categoriesResponse] = await Promise.all([
    getArticles(1, 9),
    getCategories()
  ]);

  const articles = articlesResponse.data;
  const meta = articlesResponse.meta;
  const categories = categoriesResponse.data;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Use the imported Header component */}
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-blue-700 text-white text-center py-16 px-4">
            <p className="font-semibold text-sm mb-2">Blog guides</p>
            <h1 className="text-4xl md:text-5xl font-bold max-w-4xl mx-auto leading-tight">
                The Journal: Design Resources, Interviews, and Industry News
            </h1>
            <p className="mt-4 text-lg text-blue-200">Your daily dose of design insights!</p>
            
            {/* Filter and Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-lg shadow-lg">
                
                {/* UPDATE: Replace static button with the new dynamic component */}
                <CategoryFilter categories={categories} />

                <div className="relative flex-grow">
                  <input 
                      type="text"
                      placeholder="Search article..."
                      className="w-full h-full px-4 py-2 rounded-md text-gray-800 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </section>

        {/* Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <p className="text-gray-600 mb-6">Showing: {articles.length} of {meta?.total ?? 0} articles</p>
          
            {articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold">No Articles Found</h2>
                    <p className="text-gray-500 mt-2">There are no articles to display at the moment.</p>
                </div>
            )}

           {/* Pagination */}
           <div className="flex justify-center items-center mt-12 space-x-2">
               <button className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">&lt; Previous</button>
               <button className="px-4 py-2 rounded-md text-gray-800 bg-gray-200 font-bold">1</button>
               <button className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">2</button>
               <button className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">Next &gt;</button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}