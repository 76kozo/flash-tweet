# Flash Tweet ⚡️

AIを活用して、X（旧Twitter）への投稿を瞬時に作成・支援するPWA（プログレッシブウェブアプリ）です。

[![Screenshot of Flash Tweet](https://raw.githubusercontent.com/your-username/flash-tweet/main/docs/screenshot.png)](https://raw.githubusercontent.com/your-username/flash-tweet/main/docs/screenshot.png)
*(Note: 上のスクリーンショットURLは、リポジトリ作成後に実際のパスに合わせて更新してください。)*

## ✨ 主な機能

- **AIによるツイート生成**: キーワードや短い文章を入力するだけで、Geminiが魅力的なツイート本文と、内容にマッチした画像を生成します。
- **プロンプト変換シールド**: 生成された日本語の本文を、画像生成AIに最適化された英語の「ビジュアルプロンプト」へ自動的に"翻訳"。これにより、プロンプトの指示文が画像に混入することなく、高品質な画像のみを生成します。
- **柔軟な編集機能**:
  - AIが生成した本文は、投稿前に自由に編集できます。
  - テキストはそのままに、**画像だけを何度でも再生成**することが可能です。
- **ワンクリック投稿支援**:
  - 「Xに投稿する」ボタン一つで、以下の動作を自動で行います。
    1. 生成・編集したツイート本文をクリップボードへコピー。
    2. 生成された画像をPCにダウンロード。
    3. 本文が入力された状態でXの投稿画面を新しいタブで表示。
- **PWA対応**: スマートフォンやデスクトップにアプリとしてインストールして、素早くアクセスできます。
- **セキュアなAPIキー管理**: APIキーは、お使いのブラウザのローカルストレージにのみ保存され、外部サーバーには送信されません。

## 🛠️ 使用技術

- **フレームワーク**: [Next.js](https://nextjs.org/) (App Router)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **AIモデル**:
  - **テキスト生成**: Google [Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/flash/)
  - **画像生成**: Google [Gemini Pro Vision](https://deepmind.google/technologies/gemini/) (REST API)
- **UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **状態管理**: [Zustand](https://github.com/pmndrs/zustand)
- **通知**: [Sonner](https://sonner.emilkowal.ski/)
- **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa)

## 🚀 セットアップと実行方法

1.  **リポジトリをクローン**:
    ```bash
    git clone https://github.com/your-username/flash-tweet.git
    cd flash-tweet
    ```

2.  **依存関係をインストール**:
    ```bash
    npm install
    ```

3.  **環境変数を設定**:
    - `.env.local.example` をコピーして `.env.local` という名前のファイルを作成します。
    - ファイル内に、お使いのGoogle Gemini APIキーを設定してください。
      ```
      GEMINI_API_KEY=YOUR_GEMINI_API_KEY
      ```

4.  **開発サーバーを起動**:
    ```bash
    npm run dev
    ```

5.  **ブラウザで開く**:
    - [http://localhost:3000](http://localhost:3000) にアクセスします。
    - 画面の指示に従ってAPIキーを保存すれば、すぐに利用を開始できます。

## 📜 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。
