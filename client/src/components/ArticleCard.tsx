export default function ArticleCard({ article, variant = 'white' }: ArticleCardProps) {
  return (
    <Card 
      className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105"
    >
      <CardHeader>
        <h3 className="text-xl font-bold mb-2">{article.title}</h3>
      </CardHeader>
    </Card>
  )
} 