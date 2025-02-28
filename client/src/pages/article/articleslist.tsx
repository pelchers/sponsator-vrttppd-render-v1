import Link from "next/link"

// This is mock data. In a real application, you would fetch this from your backend.
const articles = [
  { id: "1", title: "Introduction to Next.js" },
  { id: "2", title: "Advanced React Patterns" },
  { id: "3", title: "Building Scalable Web Applications" },
]

export default function ArticlesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Articles</h1>
      <ul className="space-y-4">
        {articles.map((article) => (
          <li key={article.id} className="bg-white shadow rounded-lg p-4">
            <Link href={`/article/${article.id}`} className="text-blue-600 hover:underline">
              {article.title}
            </Link>
            <Link href={`/article/edit/${article.id}`} className="ml-4 text-green-600 hover:underline">
              Edit
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/article/edit/new"
        className="mt-6 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create New Article
      </Link>
    </div>
  )
}

