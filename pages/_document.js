import { Html, Head, Main, NextScript } from "next/document";

// Ensure dark mode persists across navigations and reloads without a flash
const setInitialTheme = `(() => {
  try {
    const t = localStorage.getItem('theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (_) {}
})();`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Run before the app hydrates to avoid theme flash */}
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
