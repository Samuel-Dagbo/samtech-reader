"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Loader2, Upload, Server, Settings, AlertTriangle, FileText } from "lucide-react";
import { compressPdf } from "@/lib/pdf-compressor";

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
  const [configuring, setConfiguring] = useState(false);
  const [showSizeBanner, setShowSizeBanner] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [compressionResult, setCompressionResult] = useState<{ before: string; after: string } | null>(null);
  const router = useRouter();

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  async function configureUploadLimits() {
    setConfiguring(true);
    try {
      const res = await fetch("/api/cloudinary/configure-preset", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Cloudinary upload limit increased to 50MB!");
        setShowSizeBanner(false);
      } else {
        toast.error(data.error || "Could not configure limit");
      }
    } catch {
      toast.error("Could not reach server");
    } finally {
      setConfiguring(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (pdfFile.size > MAX_FILE_SIZE) {
      toast.error(`File too large (${formatSize(pdfFile.size)}). Maximum size is 50MB.`);
      return;
    }

    setLoading(true);
    const form = e.currentTarget;

    try {
      // Try to increase upload limit before uploading (silent if it fails)
      fetch("/api/cloudinary/configure-preset", { method: "POST" }).catch(() => {});

      // Step 1: Compress PDF
      let uploadFile = pdfFile;
      toast.loading("Compressing PDF...");
      try {
        const compressed = await compressPdf(pdfFile);
        const saved = pdfFile.size - compressed.size;
        if (saved > 0) {
          setCompressionResult({ before: formatSize(pdfFile.size), after: formatSize(compressed.size) });
          uploadFile = compressed;
        }
      } catch {
        // Compression failed silently, use original
      }
      toast.dismiss();

      // Step 2: Upload PDF directly to Cloudinary (bypasses Vercel body limit)
      toast.loading("Uploading PDF to cloud storage...");
      const { secure_url: cloudinaryUrl, public_id: cloudinaryPdfId } = await uploadPdfToCloudinary(uploadFile);
      toast.dismiss();

      // Step 3: Submit metadata + Cloudinary URL to server for processing
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
      const msg = err instanceof Error ? err.message : "Upload failed";
      if (msg.includes("File size too large") || msg.includes("max")) {
        setShowSizeBanner(true);
        toast.error(
          "Upload rejected by Cloudinary. Click 'Fix Upload Limits' below to allow files up to 50MB."
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {showSizeBanner && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                  Upload limit too low
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                  Your Cloudinary upload preset rejects files over ~10MB. Click below to raise the limit
                  to 50MB — this is a one-time fix.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={configureUploadLimits}
                  disabled={configuring}
                  className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                >
                  {configuring ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="mr-2 h-4 w-4" />
                  )}
                  {configuring ? "Configuring..." : "Fix Upload Limits (50MB)"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {compressionResult && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  PDF compressed successfully
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {compressionResult.before} → {compressionResult.after}
                </p>
              </div>
            </div>
          </div>
        )}

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
                onChange={(e) => {
                  setPdfFile(e.target.files?.[0] || null);
                  setShowSizeBanner(false);
                  setCompressionResult(null);
                }}
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
            <p>PDFs are automatically compressed before upload. Large files up to 50MB are supported.</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Compressing & Uploading..." : "Upload & Process Book"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
