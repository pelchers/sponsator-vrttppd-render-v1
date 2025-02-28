import PageSection from "@/components/PageSection"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// This is mock data. In a real application, you would fetch this based on the article ID.
const articleData = {
  title: "Sample Article Title",
  sections: [
    {
      type: "full-width-text",
      title: "Introduction",
      subtitle: "A brief overview",
      text: "This is the introduction to our article. It provides a brief overview of what we'll be discussing.",
    },
    {
      type: "left-media-right-text",
      title: "Key Concepts",
      mediaUrl: "/placeholder.svg",
      mediaSubtext: "Diagram of key concepts",
      subtitle: "Understanding the basics",
      text: "Here we delve into the key concepts of our topic. The image on the left provides a visual representation.",
    },
    {
      type: "full-width-media",
      title: "Visual Example",
      mediaUrl: "/placeholder.svg",
      mediaSubtext: "A comprehensive visual example",
    },
    {
      type: "left-text-right-media",
      title: "Case Study",
      subtitle: "Real-world application",
      text: "In this section, we examine a real-world case study. The image on the right illustrates the outcomes.",
      mediaUrl: "/placeholder.svg",
      mediaSubtext: "Case study results",
    },
  ],
  citations: "Smith, J. (2023). Example Study. Journal of Examples, 1(1), 1-10.",
  contributors: "John Doe, Jane Smith",
  relatedMedia: "Video: 'Further Exploration' - available on YouTube",
  tags: ["technology", "science", "research"],
  comments: [
    { author: "Alice", text: "Great article! Very informative." },
    { author: "Bob", text: "I have a question about the third section. Can you elaborate more on that?" },
  ],
}

export default function ArticleViewPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{articleData.title}</h1>

      <div className="mb-4">
        {articleData.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          >
            #{tag}
          </span>
        ))}
      </div>

      {articleData.sections.map((section, index) => (
        <PageSection key={index} title={section.title}>
          {section.type === "full-width-text" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{section.subtitle}</h3>
              <p>{section.text}</p>
            </div>
          )}
          {section.type === "full-width-media" && (
            <div className="space-y-2">
              <div className="relative w-full h-96">
                <Image src={section.mediaUrl || "/placeholder.svg"} alt={section.title} fill className="object-cover" />
              </div>
              <p className="text-sm text-gray-500">{section.mediaSubtext}</p>
            </div>
          )}
          {section.type === "left-media-right-text" && (
            <div className="flex gap-4">
              <div className="w-1/2 space-y-2">
                <div className="relative w-full h-64">
                  <Image
                    src={section.mediaUrl || "/placeholder.svg"}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500">{section.mediaSubtext}</p>
              </div>
              <div className="w-1/2 space-y-4">
                <h3 className="text-xl font-semibold">{section.subtitle}</h3>
                <p>{section.text}</p>
              </div>
            </div>
          )}
          {section.type === "left-text-right-media" && (
            <div className="flex gap-4">
              <div className="w-1/2 space-y-4">
                <h3 className="text-xl font-semibold">{section.subtitle}</h3>
                <p>{section.text}</p>
              </div>
              <div className="w-1/2 space-y-2">
                <div className="relative w-full h-64">
                  <Image
                    src={section.mediaUrl || "/placeholder.svg"}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500">{section.mediaSubtext}</p>
              </div>
            </div>
          )}
        </PageSection>
      ))}

      <PageSection title="Citations">
        <p>{articleData.citations}</p>
      </PageSection>

      <PageSection title="Contributors">
        <p>{articleData.contributors}</p>
      </PageSection>

      <PageSection title="Related Media">
        <p>{articleData.relatedMedia}</p>
      </PageSection>

      <PageSection title="Comments">
        {articleData.comments.map((comment, index) => (
          <Card key={index} className="mb-4">
            <CardContent>
              <p className="font-semibold">{comment.author}</p>
              <p>{comment.text}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Add a comment</h3>
            <form className="space-y-4">
              <Input placeholder="Your name" />
              <Textarea placeholder="Your comment" />
              <Button type="submit">Post Comment</Button>
            </form>
          </CardContent>
        </Card>
      </PageSection>
    </div>
  )
}

