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

// --- DATA FETCHING FUNCTIONS ---
async function getArticleById(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`https://test-fe.mysellerpintar.com/api/articles/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch article');
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Fetch 3 other articles for "Other articles" section
async function getOtherArticles(currentId: string): Promise<Article[]> {
  try {
    const res = await fetch(`https://test-fe.mysellerpintar.com/api/articles?limit=4`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    // Filter out the current article and take 3 others
    return (data.data || []).filter((a: Article) => a.id !== currentId).slice(0, 3);
  } catch {
    return [];
  }
}

const formatDate = (dateString: string) => 
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// --- MAIN PAGE COMPONENT ---
export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id);
  const otherArticles = article ? await getOtherArticles(article.id) : [];

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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full pb-16 pt-8 px-4">
        <section>
          <div className="mb-3 text-gray-500 text-sm flex items-center justify-center gap-2">
            <span>{formatDate(article.createdAt)}</span>
            <span>•</span>
            <span>Created by {article.user.username}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight text-center mb-8">{article.title}</h1>
          {article.imageUrl && (
            <div className="relative w-full h-72 md:h-[360px] rounded-lg overflow-hidden mb-8 shadow-lg">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                style={{ objectFit: 'cover' }}
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
          )}
          <div 
            className="prose lg:prose-xl max-w-none mx-auto mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </section>

        {/* Other articles section */}
        {otherArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="font-semibold text-xl mb-6">Other articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {otherArticles.map((a) => (
                <Link href={`/articles/${a.id}`} key={a.id} className="block group">
                  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                    <div className="relative w-full h-40 bg-gray-200">
                      {a.imageUrl ? (
                        <Image
                          src={a.imageUrl}
                          alt={a.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500"><span>No Image</span></div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <p className="text-xs text-gray-500 mb-1">{formatDate(a.createdAt)}</p>
                      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-700">{a.title}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{a.content.replace(/<[^>]+>/g, '').slice(0, 100)}...</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{a.category.name}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}