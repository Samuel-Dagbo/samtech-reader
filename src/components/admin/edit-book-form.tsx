"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  Loader2, BookOpen, ImageIcon, X, Save, ArrowLeft, Upload,
} from "lucide-react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dmjcwnmpu";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "samtech_reader_books";

interface EditBookFormProps {
  book: {
    _id: string;
    title: string;
    author: string;
    description: string;
    genre?: string;
    tags?: string;
    coverImage?: string;
    totalChapters?: number;
    totalPages?: number;
    readingTime?: number;
  };
}

export function EditBookForm({ book }: EditBookFormProps) {
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const router = useRouter();

  const currentCover = coverPreview || book.coverImage || null;

  async function uploadCover(file: File): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Cover upload failed: ${err}`);
    }

    const data = await res.json();
    return { url: data.secure_url, publicId: data.public_id };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (coverFile) {
        toast.loading("Uploading cover image...");
        const { url, publicId } = await uploadCover(coverFile);
        toast.dismiss();
        toast.loading("Saving changes...");
        formData.set("coverUrl", url);
        formData.set("coverPublicId", publicId);
      }

      const res = await fetch(`/api/books/${book._id}`, {
        method: "PATCH",
        body: formData,
      });

      toast.dismiss();

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      toast.success("Book updated successfully!");
      router.push("/admin/books");
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss();
      toast.error(err instanceof Error ? err.message : "Failed to update book");
    } finally {
      setLoading(false);
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be under 10MB");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function removeNewCover() {
    setCoverFile(null);
    setCoverPreview(null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Book</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update details, cover, or metadata
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left — Cover */}
          <div className="space-y-4">
            <Label>Book Cover</Label>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 group">
              {currentCover ? (
                <>
                  <img
                    src={currentCover}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  {coverFile && (
                    <button
                      type="button"
                      onClick={removeNewCover}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <label className="cursor-pointer hidden group-hover:flex items-center gap-2 rounded-lg bg-background/90 px-4 py-2 text-sm font-medium shadow-sm hover:bg-background transition-colors">
                      <Upload className="h-4 w-4" />
                      Change Cover
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground/60 mb-1">No Cover</p>
                  <p className="text-xs text-muted-foreground/40">Click to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Recommended: 1200×1600px, max 10MB
            </p>
          </div>

          {/* Right — Details */}
          <div className="space-y-8">
            {/* Basic Info */}
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <BookOpen className="h-4 w-4" />
                  Basic Information
                </div>
                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={book.title} required className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" name="author" defaultValue={book.author} required className="h-10" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input id="genre" name="genre" defaultValue={book.genre || ""} placeholder="Fiction, Science, etc." className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" name="tags" defaultValue={book.tags || ""} placeholder="classic, novel, 1920s" className="h-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    defaultValue={book.description}
                    className="flex w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[120px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {(book.totalChapters !== undefined || book.totalPages !== undefined) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <BookOpen className="h-4 w-4" />
                    Book Stats
                  </div>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-3 gap-4">
                    {book.totalChapters !== undefined && (
                      <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
                        <p className="text-2xl font-bold">{book.totalChapters}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Chapters</p>
                      </div>
                    )}
                    {book.totalPages !== undefined && (
                      <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
                        <p className="text-2xl font-bold">{book.totalPages}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pages</p>
                      </div>
                    )}
                    {book.readingTime !== undefined && (
                      <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
                        <p className="text-2xl font-bold">{book.readingTime}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Minutes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 min-w-[160px]">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
