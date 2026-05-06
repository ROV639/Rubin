/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderScript, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_D2Kf9P1G.mjs';
import 'piccolore';
import 'html-escaper';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CZiTRC_z.mjs';
export { renderers } from '../renderers.mjs';

const $$Admin = createComponent(async ($$result, $$props, $$slots) => {
  const categories = [
    { key: "eve-city", label: "EVE\u57CE\u5E02" },
    { key: "eve-daily", label: "EVE\u65E5\u5E38" },
    { key: "eve-cover", label: "EVE\u5C01\u9762" },
    { key: "portrait", label: "\u4EBA\u50CF" },
    { key: "product", label: "\u4EA7\u54C1" },
    { key: "landscape", label: "\u98CE\u666F" },
    { key: "other", label: "\u5176\u5B83" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u7BA1\u7406\u540E\u53F0 \u2014 \u6CFD\u5DDD" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-base p-6"> <div class="max-w-2xl mx-auto"> <!-- Header --> <div class="flex items-center justify-between mb-8"> <div> <h1 class="font-serif text-2xl text-text">管理后台</h1> <p class="text-text/40 text-sm mt-1">上传和管理图片</p> </div> <a href="/" class="text-text/40 hover:text-text text-sm">返回首页</a> </div> <!-- Login Form --> <div id="login-form" class="bg-surface rounded-xl border border-border p-8 shadow-sm mb-6"> <h2 class="font-sans text-lg text-text mb-4">登录</h2> <input type="password" id="password" placeholder="输入管理密码..." class="w-full px-4 py-3 bg-base border border-border rounded-lg text-text placeholder:text-text/30 focus:outline-none focus:border-primary transition-colors mb-4"> <button id="login-btn" class="w-full py-3 bg-text text-base rounded-lg hover:bg-text/80 transition-colors">
进入后台
</button> <p id="error-msg" class="text-red-500 text-sm mt-3 hidden">密码错误</p> </div> <!-- Admin Panel --> <div id="admin-panel" class="hidden"> <!-- Upload Section --> <div class="bg-surface rounded-xl border border-border p-6 mb-6"> <h2 class="font-sans text-lg text-text mb-4">上传图片</h2> <!-- Upload Platform Selection --> <div class="flex gap-3 mb-4"> <button id="btn-imgbb" class="px-4 py-2 rounded-lg border border-border text-sm transition-colors bg-text text-base" data-platform="imgbb">
imgbb
</button> <button id="btn-qiniu" class="px-4 py-2 rounded-lg border border-border text-sm transition-colors text-text/60" data-platform="qiniu">
七牛云
</button> </div> <!-- Dropzone --> <div id="dropzone" class="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"> <input type="file" id="file-input" accept="image/*" class="hidden" multiple> <div class="text-text/40"> <p class="text-3xl mb-2">📁</p> <p class="font-sans">拖拽图片到这里，或<span class="text-primary">点击选择</span></p> <p class="text-xs text-text/30 mt-2">支持 PNG, JPG, WebP，最大 32MB</p> </div> </div> <!-- Preview --> <div id="preview-area" class="hidden mb-4"> <div class="grid grid-cols-4 gap-3" id="preview-grid"></div> </div> <!-- Prompt & Category --> <div class="flex gap-3 mb-4"> <input type="text" id="prompt-input" placeholder="描述这张图片..." class="flex-1 px-4 py-3 bg-base border border-border rounded-lg text-text text-sm placeholder:text-text/30 focus:outline-none focus:border-primary"> <select id="category-select" class="px-4 py-3 bg-base border border-border rounded-lg text-text text-sm focus:outline-none focus:border-primary"> ${categories.map((cat) => renderTemplate`<option${addAttribute(cat.key, "value")}>${cat.label}</option>`)} </select> </div> <!-- Upload Button --> <button id="upload-btn" class="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors font-sans">
上传
</button> </div> <!-- Uploaded List --> <div class="bg-surface rounded-xl border border-border p-6"> <div class="flex items-center justify-between mb-4"> <h2 class="font-sans text-lg text-text">已上传</h2> <span id="img-count" class="text-text/40 text-sm">0 张</span> </div> <div id="upload-list" class="space-y-3 max-h-96 overflow-y-auto"> <p class="text-text/40 text-sm text-center py-8">暂无上传</p> </div> </div> </div> </div> </div>  <div id="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-text text-base rounded-full opacity-0 transition-opacity pointer-events-none">
上传成功！
</div> ` })} ${renderScript($$result, "/Users/robin/AgentProject/Rubin/src/pages/admin.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/robin/AgentProject/Rubin/src/pages/admin.astro", void 0);

const $$file = "/Users/robin/AgentProject/Rubin/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
