"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Loader2, Upload, Server } from "lucide-react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dmjcwnmpu";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "samtech_reader_books";

async function uploadPdfToCloudinary(file: File): Promise<{ secure_url: string; public_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const result = await uploadRes.json();
  return { secure_url: result.secure_url, public_id: result.public_id };
}

export function BookForm() {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;

    try {
      // Step 1: Upload PDF directly to Cloudinary (bypasses Vercel body limit)
      toast.loading("Uploading PDF to cloud storage...");
      const { secure_url: cloudinaryUrl, public_id: cloudinaryPdfId } = await uploadPdfToCloudinary(pdfFile);
      toast.dismiss();

      // Step 2: Submit metadata + Cloudinary URL to server for processing
      toast.loading("Processing book content...");
      const formData = new FormData(form);
      formData.delete("pdf");
      formData.set("cloudinaryUrl", cloudinaryUrl);
      formData.set("cloudinaryPdfId", cloudinaryPdfId);
      if (coverFile) formData.set("cover", coverFile);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.dismiss();

      toast.success(`Book uploaded! ${data.chapterCount} chapters created.`);
      router.push("/admin/books");
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss();
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Book Title *</Label>
              <Input id="title" name="title" placeholder="The Great Gatsby" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input id="author" name="author" placeholder="F. Scott Fitzgerald" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input id="genre" name="genre" placeholder="Fiction, Science, etc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" placeholder="classic, novel, 1920s" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="A brief description of the book..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>PDF File *</Label>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("pdf-upload")?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {pdfFile ? pdfFile.name : "Click to upload a PDF file"}
              </p>
              <input
                id="pdf-upload"
                name="pdf"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cover Image (optional)</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("cover-upload")?.click()}
            >
              <p className="text-sm text-muted-foreground">
                {coverFile ? coverFile.name : "Click to upload cover image"}
              </p>
              <input
                id="cover-upload"
                name="cover"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground flex items-start gap-3">
            <Server className="h-5 w-5 shrink-0 mt-0.5" />
            <p>PDFs are uploaded directly to cloud storage, enabling support for large files up to 50MB.</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Uploading & Processing..." : "Upload & Process Book"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
