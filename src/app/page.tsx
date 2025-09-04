'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { generatePoemAndTitle } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, LoaderCircle, AlertCircle, Copy, Check } from 'lucide-react';

export default function PicturePoetPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{ poem: string; title: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('Image size should be less than 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUrl(e.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageDataUrl) {
      setError('Please upload an image first.');
      return;
    }
    startTransition(async () => {
      setError(null);
      setResult(null);
      const response = await generatePoemAndTitle({ photoDataUri: imageDataUrl, prompt });

      if (response.success) {
        setResult({ poem: response.poem!, title: response.title! });
      } else {
        setError(response.error!);
      }
    });
  };

  const handleCopy = () => {
    if (result) {
      const textToCopy = `"${result.title}"\n\n${result.poem}`;
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Copied to Clipboard!",
        description: "The poem and title are ready to be shared.",
      });
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Picture Poet
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Transform your photos into lyrical masterpieces.
          </p>
        </header>

        <Card className="w-full shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Upload Your Inspiration</CardTitle>
              <CardDescription>Select an image and provide a prompt to generate a poem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="picture" className="sr-only">Upload Picture</Label>
                <div 
                  className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary/50"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  tabIndex={0}
                  role="button"
                  aria-label="Upload an image"
                >
                  {imageDataUrl ? (
                    <Image
                      src={imageDataUrl}
                      alt="Uploaded preview"
                      fill
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <UploadCloud className="h-10 w-10" />
                      <p className="font-semibold">Click or drag to upload</p>
                      <p className="text-xs">PNG, JPG, WEBP up to 4MB</p>
                    </div>
                  )}
                </div>
                <Input
                  id="picture"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., 'Write in a melancholic style', 'Focus on the colors of the sunset'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isPending}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!imageDataUrl || isPending}>
                {isPending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Poem'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Card className="w-full shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28 rounded-md" />
            </CardFooter>
          </Card>
        )}

        {result && (
          <Card className="w-full animate-in fade-in-50 slide-in-from-bottom-10 duration-500 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">{result.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
              <div className="relative aspect-square h-auto w-full overflow-hidden rounded-lg">
                <Image
                  src={imageDataUrl!}
                  alt="Poem inspiration"
                  fill
                  className="object-cover"
                  data-ai-hint="poem inspiration"
                />
              </div>
              <p className="whitespace-pre-wrap font-body text-base leading-relaxed text-foreground/90">
                {result.poem}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleCopy}>
                {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {isCopied ? 'Copied!' : 'Copy Poem & Title'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}
