import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PREFIXED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevToolBox - Free Online Developer Tools",
  description: "Fast, free, and online developer utilities. JSON formatter, Base64 encoder, UUID generator and more.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

/** 语言检测脚本：同步执行，阻塞渲染，消除首屏闪烁 */
const localeDetectScript = `
(function(){
  var PREFIXED=${JSON.stringify(PREFIXED_LOCALES)};
  var ZH_TW=['zh-TW','zh-Hant','zh-HK','zh-MO'];
  var ZH_CN=['zh-CN','zh-Hans','zh-SG','zh'];
  var locale=localStorage.getItem('NEXT_LOCALE');
  if(!locale){
    var lang=navigator.language||(navigator.languages&&navigator.languages[0])||'';
    if(ZH_TW.some(function(l){return lang.startsWith(l);})) locale='zh-TW';
    else if(ZH_CN.some(function(l){return lang.startsWith(l);})) locale='zh-CN';
    else locale='en';
    localStorage.setItem('NEXT_LOCALE',locale);
  }
  var path=window.location.pathname;
  var hasLocale=PREFIXED.some(function(l){return path=='/'+l||path.startsWith('/'+l+'/');});
  if(!hasLocale&&locale!=='${DEFAULT_LOCALE}'){
    window.location.replace('/'+locale+path);
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* 语言检测脚本：放在最前面同步执行，消除语言切换闪烁 */}
        <script dangerouslySetInnerHTML={{ __html: localeDetectScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
