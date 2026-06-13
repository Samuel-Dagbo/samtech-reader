"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  Loader2, BookOpen, ImageIcon, X, Save, ArrowLeft, Upload, Layers, Clock, Hash, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              <span className="h-px w-6 bg-gradient-to-r from-primary to-primary/30" />
              Edit
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Edit book
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update details, cover, or metadata
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <Label>Book cover</Label>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-border/60 bg-muted/30 group hover:border-primary/40 transition-colors">
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
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                      aria-label="Remove new cover"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <label className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center cursor-pointer">
                    <span className="hidden group-hover:flex items-center gap-2 rounded-lg bg-background/95 px-4 py-2 text-sm font-medium shadow-sm">
                      <Upload className="h-4 w-4" />
                      Change cover
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverChange}
                    />
                  </label>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground/60 mb-1">No cover</p>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Basic information
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
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={book.description}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {(book.totalChapters !== undefined || book.totalPages !== undefined) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Book stats
                  </div>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-3 gap-4">
                    {book.totalChapters !== undefined && (
                      <div className="rounded-xl bg-muted/50 border border-border/60 px-4 py-3 text-center hover:border-primary/30 transition-colors">
                        <Layers className="h-4 w-4 mx-auto text-primary mb-1.5" />
                        <p className="text-2xl font-bold font-display">{book.totalChapters}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Chapters</p>
                      </div>
                    )}
                    {book.totalPages !== undefined && (
                      <div className="rounded-xl bg-muted/50 border border-border/60 px-4 py-3 text-center hover:border-primary/30 transition-colors">
                        <Hash className="h-4 w-4 mx-auto text-primary mb-1.5" />
                        <p className="text-2xl font-bold font-display">{book.totalPages}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pages</p>
                      </div>
                    )}
                    {book.readingTime !== undefined && (
                      <div className="rounded-xl bg-muted/50 border border-border/60 px-4 py-3 text-center hover:border-primary/30 transition-colors">
                        <Clock className="h-4 w-4 mx-auto text-primary mb-1.5" />
                        <p className="text-2xl font-bold font-display">{book.readingTime}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Minutes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 min-w-[160px]" size="lg">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
