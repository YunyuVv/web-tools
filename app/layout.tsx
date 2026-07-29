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

/** 侧栏状态脚本：同步执行，在首帧绘制前把持久化状态写到 <html data-sidebar>。
 *  无论展开还是收起都显式写入，配合 globals.css 的 base opacity:0 + [data-sidebar] 规则，
 *  保证“首帧即正确态”。该脚本以裸 <script> 形式置于 <head> 最前（已验证在 output:'export'
 *  导出构建与 dev 下均保留为绘制前同步执行的裸内联脚本，而非被延迟到注水的 self.__next_s.push）。 */
const sidebarStateScript = `
try{
  var collapsed = localStorage.getItem('devtoolbox:sidebar-collapsed')==='true';
  document.documentElement.setAttribute('data-sidebar', collapsed ? 'collapsed' : 'expanded');
}catch(e){}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* 语言检测：裸内联 <script> 置于 <head> 最前，绘制前同步执行，
            在首帧绘制前完成语言重定向，消除语言切换闪烁 */}
        <script
          id="locale-detect"
          dangerouslySetInnerHTML={{ __html: localeDetectScript }}
        />
        {/* 侧栏状态：同样裸内联、绘制前同步写入 <html data-sidebar>，
            配合 globals.css（base opacity:0 + [data-sidebar] 规则）实现“首帧即正确态”，
            彻底消除刷新/跳页时的“展开→收起”错误态闪动 */}
        <script
          id="sidebar-state"
          dangerouslySetInnerHTML={{ __html: sidebarStateScript }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
