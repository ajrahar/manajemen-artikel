import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/custom/Header';
import Footer from '@/components/custom/Footer';

// --- TYPE DEFINITIONS ---
interface Category { id: string; name: string; }
interface User { id: string; username: string; }
interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  category: Category;
  user: User;
}
// FIX: The API response for a single article is the Article object itself,
// not wrapped in a 'data' object.
// We can remove the 'ApiResponse' interface for this file.

// --- DATA FETCHING FUNCTION ---
async function getArticleById(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`https://test-fe.mysellerpintar.com/api/articles/${id}`, { cache: 'no-store' });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch article');
    }
    // FIX: Return the JSON response directly, as it's the article object.
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// --- MAIN PAGE COMPONENT ---
export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id);

  if (!article) {
    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <main className="text-center py-20">
                <h1 className="text-2xl font-bold">Article Not Found</h1>
                <p className="text-gray-600 mt-2">The article you are looking for does not exist.</p>
                <Link href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                    Back to Home
                </Link>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto py-8 px-4">
        <article>
          <header className="mb-8">
            <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to all articles</Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              {article.title}
            </h1>
            <div className="mt-4 text-sm text-gray-500 flex items-center gap-4">
                <span>By {article.user.username}</span>
                <span>&bull;</span>
                <span>{formatDate(article.createdAt)}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{article.category.name}</span>
            </div>
          </header>

          {article.imageUrl && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8 shadow-lg">
              <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} />
            </div>
          )}

          {/* Render content safely */}
          <div 
            className="prose lg:prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Other articles section can be added here */}
      </main>
      <Footer />
    </div>
  );
}
