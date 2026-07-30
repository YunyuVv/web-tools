import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Script from 'next/script';
import { PREFIXED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const geistSans = GeistSans;
const geistMono = GeistMono;

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
        {/* Cloudflare Web Analytics：免费、无 Cookie、无流量上限。
            spa:true 关键 —— 本站是 Next.js App Router，用户在工具页之间跳转是
            客户端路由（不整页刷新），默认 beacon 抓不到这类站内跳转；spa:true
            让 CF 自动捕获前端路由变化，统计才完整。
            裸 <script> 置于 <head>，导出构建下保留为绘制前同步执行（已验证，
            不会被序列化为 self.__next_s.push 延迟到注水）。
            token 通过环境变量 NEXT_PUBLIC_CF_BEACON_TOKEN 注入；未配置时
            整个脚本不渲染（不加载空 token beacon，避免报错）。需重新构建生效。 */}
        {process.env.NEXT_PUBLIC_CF_BEACON_TOKEN ? (
          <script
            id="cf-web-analytics"
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({
              token: process.env.NEXT_PUBLIC_CF_BEACON_TOKEN,
              spa: true,
            })}
          />
        ) : null}
        {/* Google AdSense：NEXT_PUBLIC_ADSENSE_CLIENT_ID 控制；未配置时不注入。
           静态导出下用 afterInteractive（beforeInteractive 会被延迟到注水、失效）。
           仅生产构建（Cloudflare 填入 ID）才加载广告；本地/预览零广告。 */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ? (
          <Script
            id="adsbygoogle-loader"
            strategy="lazyOnload"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        ) : null}
        {/* Google 广告同意管理平台（Funding Choices）：覆盖 EEA/UK，GDPR 强制。
           NEXT_PUBLIC_ADSENSE_FC_ID 为 AdSense 后台「隐私权和消息」生成的发布商数字 ID；
           未配置则不注入（非欧盟流量不受影响）。 */}
        {process.env.NEXT_PUBLIC_ADSENSE_FC_ID ? (
          <Script
            id="google-funding-choices"
            strategy="lazyOnload"
            async
            src={`https://fundingchoicesmessages.google.com/i/${process.env.NEXT_PUBLIC_ADSENSE_FC_ID}.js`}
          />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
