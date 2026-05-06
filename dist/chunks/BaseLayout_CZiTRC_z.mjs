import { c as createComponent, e as renderHead, f as renderSlot, a as renderScript, b as renderTemplate, g as createAstro } from './astro/server_D2Kf9P1G.mjs';
import 'piccolore';
import 'html-escaper';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="zh"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="theme-color" content="#1A2E45"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="泽川"><title>${title}</title><link rel="manifest" href="/manifest.json"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/icons/icon-192.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&family=Noto+Serif+SC:wght@400;600&family=Noto+Sans+SC:wght@400;500&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-base text-neutral font-sans antialiased"> ${renderSlot($$result, $$slots["default"])} ${renderScript($$result, "/Users/robin/AgentProject/Rubin/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html> `;
}, "/Users/robin/AgentProject/Rubin/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
