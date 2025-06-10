"use client";

import { useState, useEffect } from "react";
import { useApiKeysStore } from "@/store/apiKeysStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function ApiKeySettings() {
  const {
    geminiApiKey,
    setGeminiApiKey,
    clearApiKeys,
  } = useApiKeysStore();

  const [localGeminiKey, setLocalGeminiKey] = useState("");

  useEffect(() => {
    setLocalGeminiKey(geminiApiKey || "");
  }, [geminiApiKey]);

  const handleSave = () => {
    setGeminiApiKey(localGeminiKey);
    alert("APIキーを保存しました。");
  };

  const handleClear = () => {
    clearApiKeys();
    setLocalGeminiKey("");
    alert("APIキーを削除しました。");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>APIキー設定</CardTitle>
        <CardDescription>
          GeminiのAPIキーを入力してください。キーは安全にローカルに保存されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>セキュリティに関するご注意</AlertTitle>
          <AlertDescription>
            APIキーはお使いのブラウザのローカルストレージに保存されます。共有のコンピューターでは使用せず、利用後はキーを削除することを強く推奨します。
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <Label htmlFor="gemini-key">Gemini APIキー</Label>
          <Input
            id="gemini-key"
            type="password"
            placeholder="お使いのGemini APIキーを入力"
            value={localGeminiKey}
            onChange={(e) => setLocalGeminiKey(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="destructive" onClick={handleClear}>
          キーを削除
        </Button>
        <Button onClick={handleSave}>キーを保存</Button>
      </CardFooter>
    </Card>
  );
}