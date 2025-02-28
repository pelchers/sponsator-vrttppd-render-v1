"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Post {
  id: string
  title: string
  mediaUrl: string
  tags: string[]
  description: string
}

export default function PostEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post>({
    id: params.id,
    title: "",
    mediaUrl: "",
    tags: [],
    description: "",
  })

  useEffect(() => {
    if (params.id !== "new") {
      // Fetch post data if editing an existing post
      // This is where you'd normally fetch data from your API
      // For now, we'll just set some dummy data
      setPost({
        id: params.id,
        title: "Existing Post Title",
        mediaUrl: "/placeholder.svg",
        tags: ["tag1", "tag2"],
        description: "This is an existing post description.",
      })
    }
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPost((prev) => ({ ...prev, [name]: value }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim())
    setPost((prev) => ({ ...prev, tags }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Submitting post:", post)
    // After successful submission, redirect to the post view page
    router.push(`/post/${params.id === "new" ? "newly-created-id" : params.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{params.id === "new" ? "Create New Post" : "Edit Post"}</h1>
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={post.title}
                onChange={handleInputChange}
                placeholder="Enter post title"
              />
            </div>
            <div>
              <Label htmlFor="mediaUrl">Media URL</Label>
              <Input
                id="mediaUrl"
                name="mediaUrl"
                value={post.mediaUrl}
                onChange={handleInputChange}
                placeholder="Enter media URL"
              />
              {post.mediaUrl && (
                <div className="mt-2 relative w-full h-64">
                  <Image
                    src={post.mediaUrl || "/placeholder.svg"}
                    alt="Post media"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={post.tags.join(", ")}
                onChange={handleTagsChange}
                placeholder="Enter tags, separated by commas"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={post.description}
                onChange={handleInputChange}
                placeholder="Enter post description"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        <Button type="submit">{params.id === "new" ? "Create Post" : "Update Post"}</Button>
      </form>
    </div>
  )
}

