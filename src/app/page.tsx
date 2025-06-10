"use client";

import { useState, useEffect } from "react";
import { useApiKeysStore } from "@/store/apiKeysStore";
import { ApiKeySettings } from "@/components/ApiKeySettings";
import { TweetGenerator } from "@/components/TweetGenerator";

export default function Home() {
  const { geminiApiKey } = useApiKeysStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasApiKeys = !!geminiApiKey;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="container mx-auto w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Flash Tweet
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AIツイート作成アシスタント
        </p>

        <div className="mt-8 flex w-full justify-center">
          {isClient ? (
            hasApiKeys ? (
              <TweetGenerator />
            ) : (
              <ApiKeySettings />
            )
          ) : (
            <p>Loading settings...</p>
          )}
        </div>
      </div>
    </main>
  );
}
