"use client";

import { useState } from "react";
import Image from "next/image";
import { useApiKeysStore } from "@/store/apiKeysStore";
import { generateTextOnly, generateImageFromText } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Twitter } from "lucide-react";
import { toast } from "sonner";

export function TweetGenerator() {
  const { geminiApiKey } = useApiKeysStore();
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (isRetry = false) => {
    if (!keyword) {
      setError("キーワードを入力してください。");
      return;
    }
    if (!geminiApiKey) {
      setError("Gemini APIキーが設定されていません。設定画面でキーを登録してください。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedText("");
    setGeneratedImage("");
    setProgress(10);

    try {
      // Step 1: テキストを生成 (gemini-1.5-flash-latest)
      const textPrompt = `キーワード「${keyword}」について、140文字未満で絵文字とハッシュタグを1〜2個含む、創造的で魅力的なツイート本文を作成してください。`;
      const generatedTweet = await generateTextOnly(geminiApiKey, textPrompt);
      setGeneratedText(generatedTweet.trim());
      setProgress(33);

      // Step 2: 画像生成用の英語ビジュアルプロンプトに"翻訳" (gemini-1.5-flash-latest)
      const translationPrompt = `以下の日本語の文章を、画像生成AIのための視覚的な説明文（ビジュアルプロンプト）にしてください。傑作なアートを描けるように、情景が目に浮かぶような、具体的でクリエイティブな英語の文章でお願いします。返答は、翻訳後の英語プロンプトのみとし、解説や他の言葉は一切含めないでください。\n\n日本語の文章: 「${generatedTweet}」`;
      const visualPrompt = await generateTextOnly(geminiApiKey, translationPrompt);
      setProgress(66);
      
      // Step 3: "翻訳"されたプロンプトで画像を生成 (gemini-2.0-flash-preview)
      const parts = await generateImageFromText(geminiApiKey, visualPrompt);
      let imageBase64 = "";

      parts.forEach((part: any) => {
        if (part.inlineData && part.inlineData.data) {
          imageBase64 = part.inlineData.data;
        }
      });
      
      if (!imageBase64) {
        throw new Error("画像の生成に失敗しました。");
      }
      setGeneratedImage(imageBase64);
      setProgress(100);

    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("429") && !isRetry) {
        setError("レートリミットに達しました。30秒後に再試行します...");
        setTimeout(() => handleGenerate(true), 30000);
      } else {
        setError(e.message || "生成中に不明なエラーが発生しました。");
        toast.error("生成エラー", { description: e.message || "生成中に不明なエラーが発生しました。" });
      }
    } finally {
      if (!error?.includes("再試行")) {
        setIsLoading(false);
      }
    }
  };

  const handleRegenerateImage = async (isRetry = false) => {
    if (!geminiApiKey) {
      setError("Gemini APIキーが設定されていません。");
      return;
    }
    if (!generatedText) {
      setError("画像の基になるテキストが生成されていません。");
      return;
    }

    setIsRegeneratingImage(true);
    setError(null);

    try {
      // Step 1: 画像生成用の英語ビジュアルプロンプトに"翻訳"
      const translationPrompt = `以下の日本語の文章を、画像生成AIのための視覚的な説明文（ビジュアルプロンプト）にしてください。傑作なアートを描けるように、情景が目に浮かぶような、具体的でクリエイティブな英語の文章でお願いします。返答は、翻訳後の英語プロンプトのみとし、解説や他の言葉は一切含めないでください。\n\n日本語の文章: 「${generatedText}」`;
      const visualPrompt = await generateTextOnly(geminiApiKey, translationPrompt);

      // Step 2: "翻訳"されたプロンプトで画像を生成
      const parts = await generateImageFromText(geminiApiKey, visualPrompt);
      
      let imageBase64 = "";

      parts.forEach((part: any) => {
        if (part.inlineData && part.inlineData.data) {
          imageBase64 = part.inlineData.data;
        }
      });

      if (!imageBase64) {
        throw new Error("画像の再生成に失敗しました。");
      }
      
      setGeneratedImage(imageBase64);

    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("429") && !isRetry) {
        setError("レートリミットに達しました。30秒後に画像の再生成を試みます...");
        setTimeout(() => handleRegenerateImage(true), 30000);
      } else {
        setError(e.message || "画像の再生成中に不明なエラーが発生しました。");
        toast.error("画像再生成エラー", { description: e.message || "画像の再生成中に不明なエラーが発生しました。" });
      }
    } finally {
      if (!error?.includes("再試行")) {
        setIsRegeneratingImage(false);
      }
    }
  };
  
  const handlePostToX = () => {
    if (!generatedText) {
      toast.error("テキストがありません", {
        description: "投稿するツイート本文が生成されていません。",
      });
      return;
    }

    // 1. ツイート本文をクリップボードにコピー
    navigator.clipboard.writeText(generatedText).then(() => {
      toast.success("コピーしました", {
        description: "ツイート本文をクリップボードにコピーしました。",
      });
    }).catch(err => {
      console.error('クリップボードへのコピーに失敗しました: ', err);
      toast.error("コピー失敗", {
        description: "クリップボードへのコピーに失敗しました。",
      });
    });

    // 2. 生成画像をローカルにダウンロード
    if (generatedImage) {
      const byteCharacters = atob(generatedImage);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tweet-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("ダウンロードしました", {
        description: "画像をダウンロードしました。",
      });
    }
    
    // 3. Xの投稿画面を新しいタブで開く
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedText)}`;
    window.open(tweetUrl, '_blank');
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setKeyword(text);
  };

  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle>1. ツイート生成</CardTitle>
        <CardDescription>
          キーワードや文章から、AIがツイートの本文と画像を生成します。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="keyword">キーワード</Label>
          <Textarea
            id="keyword"
            placeholder="例：AIと未来、週末の過ごし方"
            value={keyword}
            onChange={handleKeywordChange}
            rows={2}
          />
          <p className="text-sm text-muted-foreground">
            ツイートのテーマとなるキーワードや文章を入力してください。
          </p>
        </div>
        <Button onClick={() => handleGenerate()} disabled={isLoading} className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-solid rounded-full border-t-transparent animate-spin mr-2"></div>
              <span>生成中...</span>
            </div>
          ) : (
            "ツイートを生成"
          )}
        </Button>

        {isLoading && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm mt-2 text-center text-muted-foreground">
              {progress < 33 ? "テキストを生成中..." : progress < 66 ? "画像を生成するための準備中..." : "画像を生成中..."}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {(generatedText || generatedImage) && !isLoading && (
        <>
          <CardHeader className="pt-6">
            <CardTitle>2. 内容の確認と投稿</CardTitle>
            <CardDescription>
              生成された内容を確認・編集し、投稿してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="generated-text">ツイート本文</Label>
              <Textarea
                id="generated-text"
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                rows={5}
                className="mt-1"
              />
            </div>

            {generatedImage && (
              <div>
                <Label>生成された画像</Label>
                <div className="mt-1 relative w-full aspect-video rounded-lg border overflow-hidden">
                  <Image
                    src={`data:image/png;base64,${generatedImage}`}
                    alt="Generated Image"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleRegenerateImage()}
              disabled={isRegeneratingImage || !generatedText}
              className="w-full sm:w-auto"
            >
              {isRegeneratingImage ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-primary border-solid rounded-full border-t-transparent animate-spin mr-2"></div>
                  <span>再生成中...</span>
                </div>
              ) : (
                "画像のみ再生成"
              )}
            </Button>
            <Button onClick={handlePostToX} className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold">
              <Twitter className="mr-2 h-5 w-5" />
              <span>Xに投稿する</span>
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}