"use client"

import type React from "react"

import { useState, useEffect } from "react"
import PageSection from "@/components/PageSection"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

type SectionType = "full-width-text" | "full-width-media" | "left-media-right-text" | "left-text-right-media"

interface Section {
  type: SectionType
  title: string
  subtitle?: string
  text?: string
  mediaUrl?: string
  mediaSubtext?: string
}

export default function ArticleEditPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("")
  const [sections, setSections] = useState<Section[]>([])
  const [citations, setCitations] = useState<string[]>([])
  const [contributors, setContributors] = useState<string[]>([])
  const [relatedMedia, setRelatedMedia] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (params.id !== "new") {
      // Fetch article data and set state
      // This is where you'd normally fetch data from your API
      // For now, we'll just set some dummy data
      setTitle("Existing Article Title")
      setSections([
        {
          type: "full-width-text",
          title: "Introduction",
          subtitle: "Getting Started",
          text: "This is an introduction to our topic.",
        },
        {
          type: "left-media-right-text",
          title: "Main Content",
          mediaUrl: "/placeholder.svg",
          mediaSubtext: "An illustrative image",
          subtitle: "Key Points",
          text: "Here are the main points of our article.",
        },
      ])
      setCitations(["Smith, J. (2023). Example Study. Journal of Examples, 1(1), 1-10."])
      setContributors(["John Doe", "Jane Smith"])
      setRelatedMedia(['Video: "Further Exploration" - available on YouTube'])
      setTags(["technology", "science", "research"])
    }
  }, [params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Submitting article:", { title, sections, citations, contributors, relatedMedia, tags })
    // After successful submission, you might want to redirect to the article view page
    // router.push(`/article/${params.id === 'new' ? 'newly-created-id' : params.id}`)
  }

  const addSection = () => {
    setSections([...sections, { type: "full-width-text", title: "" }])
  }

  const updateSection = (index: number, updates: Partial<Section>) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], ...updates }
    setSections(newSections)
  }

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index)
    setSections(newSections)
  }

  const renderSectionFields = (section: Section, index: number) => {
    switch (section.type) {
      case "full-width-text":
      case "left-text-right-media":
        return (
          <div className="space-y-4">
            <Input
              placeholder="Subtitle"
              value={section.subtitle || ""}
              onChange={(e) => updateSection(index, { subtitle: e.target.value })}
            />
            <Textarea
              placeholder="Main text"
              value={section.text || ""}
              onChange={(e) => updateSection(index, { text: e.target.value })}
              rows={6}
            />
          </div>
        )
      case "full-width-media":
      case "left-media-right-text":
        return (
          <div className="space-y-4">
            <Input
              placeholder="Media URL"
              value={section.mediaUrl || ""}
              onChange={(e) => updateSection(index, { mediaUrl: e.target.value })}
            />
            <Input
              placeholder="Media subtext"
              value={section.mediaSubtext || ""}
              onChange={(e) => updateSection(index, { mediaSubtext: e.target.value })}
            />
          </div>
        )
    }
  }

  const addCitation = () => {
    setCitations([...citations, ""])
  }

  const updateCitation = (index: number, value: string) => {
    const newCitations = [...citations]
    newCitations[index] = value
    setCitations(newCitations)
  }

  const removeCitation = (index: number) => {
    const newCitations = citations.filter((_, i) => i !== index)
    setCitations(newCitations)
  }

  const addContributor = () => {
    setContributors([...contributors, ""])
  }

  const updateContributor = (index: number, value: string) => {
    const newContributors = [...contributors]
    newContributors[index] = value
    setContributors(newContributors)
  }

  const removeContributor = (index: number) => {
    const newContributors = contributors.filter((_, i) => i !== index)
    setContributors(newContributors)
  }

  const addRelatedMedia = () => {
    setRelatedMedia([...relatedMedia, ""])
  }

  const updateRelatedMedia = (index: number, value: string) => {
    const newRelatedMedia = [...relatedMedia]
    newRelatedMedia[index] = value
    setRelatedMedia(newRelatedMedia)
  }

  const removeRelatedMedia = (index: number) => {
    const newRelatedMedia = relatedMedia.filter((_, i) => i !== index)
    setRelatedMedia(newRelatedMedia)
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTags = e.target.value.split(",").map((tag) => tag.trim())
    setTags(newTags)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Article</h1>

      <Card className="mb-6">
        <CardContent>
          <PageSection title="Article Title">
            <Input
              placeholder="Enter article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4"
            />
          </PageSection>
        </CardContent>
      </Card>

      {sections.map((section, index) => (
        <PageSection key={index} title={`Section ${index + 1}`}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Input
                placeholder="Section title"
                value={section.title}
                onChange={(e) => updateSection(index, { title: e.target.value })}
                className="w-2/3"
              />
              <Select
                value={section.type}
                onValueChange={(value: SectionType) => updateSection(index, { type: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-width-text">Full Width Text</SelectItem>
                  <SelectItem value="full-width-media">Full Width Media</SelectItem>
                  <SelectItem value="left-media-right-text">Left Media - Right Text</SelectItem>
                  <SelectItem value="left-text-right-media">Left Text - Right Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderSectionFields(section, index)}
            <Button variant="destructive" onClick={() => removeSection(index)}>
              Remove Section
            </Button>
          </div>
        </PageSection>
      ))}

      <Button onClick={addSection} className="my-4">
        Add Section
      </Button>

      <Card className="mb-6">
        <CardContent>
          <PageSection title="Tags">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="Enter tags, separated by commas"
              value={tags.join(", ")}
              onChange={handleTagsChange}
            />
          </PageSection>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent>
          <PageSection title="Citations">
            {citations.map((citation, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="Enter citation"
                  value={citation}
                  onChange={(e) => updateCitation(index, e.target.value)}
                  className="flex-grow"
                />
                <Button variant="destructive" onClick={() => removeCitation(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addCitation} className="mt-2">
              Add New Citation
            </Button>
          </PageSection>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent>
          <PageSection title="Contributors">
            {contributors.map((contributor, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="Enter contributor"
                  value={contributor}
                  onChange={(e) => updateContributor(index, e.target.value)}
                  className="flex-grow"
                />
                <Button variant="destructive" onClick={() => removeContributor(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addContributor} className="mt-2">
              Add New Contributor
            </Button>
          </PageSection>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent>
          <PageSection title="Related Media">
            {relatedMedia.map((media, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="Enter related media"
                  value={media}
                  onChange={(e) => updateRelatedMedia(index, e.target.value)}
                  className="flex-grow"
                />
                <Button variant="destructive" onClick={() => removeRelatedMedia(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addRelatedMedia} className="mt-2">
              Add New Related Media
            </Button>
          </PageSection>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} className="mt-6">
        {params.id === "new" ? "Create Article" : "Update Article"}
      </Button>
    </div>
  )
}

