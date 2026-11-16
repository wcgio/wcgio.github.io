# 博客 SEO 与 Cloudflare Pages 部署

站点地址：`https://blog.wcg.qzz.io/`。

## 2026-11-16 已执行的部署与验证

- 已通过 Wrangler Direct Upload 部署至 Pages 项目 `wcg-hexo-blog`，生产分支为 `main`，Pages 地址为 `https://wcg-hexo-blog.pages.dev/`。
- 已关联自定义域名，创建代理 CNAME：`blog.wcg.qzz.io → wcg-hexo-blog.pages.dev`，保留 Google 验证 TXT。
- Google：域名提供商验证成功；Sitemap 提交成功，平台显示发现 5 个网页。
- Bing：站点从 Google Search Console 导入，验证代码窗口明确表示无需额外验证码，因此 `webmaster_verification.bing` 留空。Sitemap 已提交，平台正在处理。
- 百度：HTML 验证成功，验证码为 `codeva-wBO4HGlCrK`；同时保留原始验证文件 `source/baidu_verify_codeva-wBO4HGlCrK.html`，通过 `skip_render` 原样发布。
- 线上检查通过：博客、文档、归档、Sitemap、百度验证文件；不存在的路径返回 404。
- Cloudflare 的 Bot Preference Sync 曾向线上 robots 追加 `Baiduspider Disallow: /`。已关闭此开关，改由站点源码维护 robots。注意：该开关按 `wcg.qzz.io` 整个区域生效，其他子域也停止追加托管 robots 内容；各站点可在自己的 robots 中维护抓取策略。

后续在博客目录执行以下命令更新线上内容：

```bash
pnpm run build
wrangler pages deploy public --project-name wcg-hexo-blog --branch main
```

Wrangler 登录过期时先执行 `wrangler login`。本次为本地手动发布，未连接 Git 自动部署，也没有创建 Git 提交或推送。

## 已配置的本地能力

- `_config.yml` 中配置站点标题、描述、语言、时区与唯一 HTTPS 域名。
- `hexo-generator-sitemap` 自动生成 `public/sitemap.xml`；适用于 Google、Bing、百度，不必分别生成三份。
- `source/robots.txt` 声明 Sitemap 并放行公开页面，排除设置页抓取。
- Stellar 输出 description、Open Graph 与 JSON-LD。
- `scripts/seo.js` 修正生成列表页指向首页的 canonical，移除 404 与设置页的 canonical 并输出 noindex；归档页保留主题的 noindex,follow。
- `webmaster_verification` 支持三个平台的 HTML meta 验证码，留空不输出标签。

```yaml
webmaster_verification:
  google: '' # google-site-verification 的 content 值
  bing: ''   # msvalidate.01 的 content 值
  baidu: ''  # baidu-site-verification 的 content 值
```

只填平台提供的 content 值，不填完整 HTML。平台验证通过后仍应保留验证配置、文件或 DNS 记录，以支持后续复验。不要把接口推送 Token 填入这些公开验证码字段。

## 1. 先发布并检查公网访问

```bash
pnpm install --frozen-lockfile
pnpm run build
curl -I https://blog.wcg.qzz.io/
curl -I https://blog.wcg.qzz.io/robots.txt
curl -I https://blog.wcg.qzz.io/sitemap.xml
```

确认首页和两个 SEO 文件返回 HTTP 200，Sitemap 内容是 XML，且列出的页面可访问。任意不存在的路径应返回 404，避免被统一重写为首页并返回 200。

本次已通过登录的 Chrome 实际打开博客，并用页面内 fetch 检查 SEO 文件返回 200。独立 Python HTTP 客户端曾收到 403，该结果与 Chrome 及 Google 成功读取 Sitemap 不同；排查时应分别记录客户端和平台的实际响应。

## 2. Google Search Console

入口：https://search.google.com/search-console

1. 在左上角资源选择器中选择或添加博客资源。现有的 `rkm.wcg.qzz.io` 资源不覆盖 `blog.wcg.qzz.io`。
2. 如果管理 `wcg.qzz.io` 的 DNS，可以添加 Domain 资源 `wcg.qzz.io`，按控制台提示设置 TXT。它将覆盖该域名下的子域与协议；也可单独添加 `blog.wcg.qzz.io` Domain 资源。
3. 如果选择 URL 前缀资源，输入完整 `https://blog.wcg.qzz.io/`。展开 HTML 标记验证，把 `google-site-verification` 的 content 值填入站点配置，重新构建部署，再回平台验证。
4. 也可使用 HTML 文件验证：把平台给出的原始验证文件放到 `source/` 根目录，并在 `_config.yml` 的 `skip_render` 中加入该文件名，部署后确认文件内容未被 Hexo 套用主题。已有 skip_render 配置时应合并保留。
5. 验证成功后进入「站点地图」，提交 `https://blog.wcg.qzz.io/sitemap.xml`。如果输入框已有站点前缀，只填 `sitemap.xml`。
6. 使用「网址检查」检查首页和一篇实际文章，进行实时测试，并在符合平台条件时请求编入索引。
7. 后续查看网页索引、抓取与搜索效果报告。Sitemap 提交成功和网页已收录是两个状态，收录由搜索引擎决定。

Google 文档：https://support.google.com/webmasters/answer/9008080

## 3. Bing Webmaster Tools

入口：https://www.bing.com/webmasters/

1. 进入控制台并选择「添加站点」，输入 `https://blog.wcg.qzz.io/`。
2. 如果 Google 已验证，可以使用「从 Google Search Console 导入」；确认导入的资源是博客域名。
3. 手动验证时选择 HTML Meta 标签，把 `msvalidate.01` 的 content 值填入 `webmaster_verification.bing`，构建部署后点击验证。也可按平台提示设置 DNS CNAME 或使用原始 XML 验证文件。
4. 进入「Sitemaps」，提交 `https://blog.wcg.qzz.io/sitemap.xml`。
5. 在 URL 检查中检查首页和实际文章；结合 Site Scan 报告修复抓取错误与重复页面。
6. IndexNow 属于后续可选项：需要单独的公开密钥文件与发布后推送流程。本次未创建虚构密钥，也未启用自动推送。

## 4. 百度搜索资源平台

入口：https://ziyuan.baidu.com/site/index

1. 进入「站点管理」添加 `https://blog.wcg.qzz.io`，按当前页面填写站点属性。
2. 选择 HTML 标签验证，把 `baidu-site-verification` 的 content 值填入 `webmaster_verification.baidu`，构建部署后验证。
3. 如果控制台提供文件验证或 DNS 验证，也可以采用对应方式。文件验证需要保留原始文件内容并加入 skip_render。
4. 在「普通收录」或控制台当前对应的链接提交入口提交首页和文章地址。若账号开放 Sitemap 提交入口，提交 `https://blog.wcg.qzz.io/sitemap.xml`；不同站点、账号的开放能力可能不同，以界面为准。
5. 如果提供 API 推送入口，接口地址与 Token 从该站点控制台获取。Token 应存入 CI Secret 或环境变量，在生产发布成功后再推送公开链接，避免写进源码、前端或构建日志。
6. 查看抓取诊断、抓取异常与索引量。百度蜘蛛应能访问文章、robots、Sitemap 和 CSS/JS。

## 5. 文章发布习惯

每篇正式文章填写准确标题和独立摘要，例如：

```yaml
---
title: Hexo 博客部署到 Cloudflare Pages
date: 2026-11-16 10:00:00
updated: 2026-11-16 10:00:00
description: 记录 Hexo 构建、Cloudflare Pages 自定义域名与站长平台验证的完整配置过程。
tags:
  - Hexo
  - Cloudflare
categories:
  - 建站
---
```

发布日期和更新时间应反映真实内容，不要每次构建都虚构更新日期。

为图片提供有意义的 alt，保持链接稳定，旧地址变更时配置 301。默认 Hello World 与渲染测试页不是高价值搜索内容，正式发布时可用实际文章替换，或按内容用途设置 `sitemap: false` 与 `robots: noindex,follow`；仅从 Sitemap 删除并不等于阻止索引。

## 6. Cloudflare Pages 准备项与构建配置

准备：Cloudflare 账号、可连接的 GitHub/GitLab 仓库、仓库访问权限、目标域名的 DNS 管理权限。当前工作目录未检测到 Git 仓库；本次没有初始化、提交或推送代码。

可以部署 Hexo 生成的静态文件，无需另备服务器或数据库。现有 Waline 是独立服务，Pages 不托管它的服务端。

| 项目 | 配置 |
| --- | --- |
| 项目类型 | Cloudflare Pages 静态站点 |
| 仓库根目录直接是博客 | Root directory 留空 |
| 仓库中博客放在 hexo-blog 子目录 | Root directory 为 `hexo-blog` |
| 构建命令 | `pnpm run build` |
| 输出目录 | `public`，相对于 Root directory |
| Node.js | 选择与本机验证一致、满足依赖要求的版本，建议 Node 22 LTS 并重新验证构建 |
| 包管理器 | pnpm 10.29.3，使用并提交 pnpm-lock.yaml |
| 自定义域名 | `blog.wcg.qzz.io` |

构建环境需要安装依赖；优先使用 `pnpm install --frozen-lockfile`。如果 Pages 自动安装没有选择正确版本，可按该构建镜像支持的方式指定 pnpm 版本或安装步骤。项目目前同时存在 npm 与 pnpm 锁文件，已同步 Sitemap 依赖；CI 要明确选择一种安装流程。

在 Pages 项目中先绑定自定义域名，再按界面创建所需 CNAME，不要只手动添加 DNS 而跳过域名绑定。等证书生效后启用统一 HTTPS。若用 pages.dev 访问同一份内容，优先配置到正式域名的永久重定向；现有 canonical 也统一指向正式域名。为预览部署设置 noindex，避免将测试版本作为正式站点提交。

不要为静态博客配置把任意路径都改写到首页的 SPA 规则。不要让 Cloudflare 挑战页阻挡搜索引擎，也不要屏蔽文章依赖的静态资源。若有 Cloudflare 托管 robots 或爬虫控制设置，发布后检查实际返回内容。

## 7. 本机 Chrome 接管状态

已开启 Chrome「查看 → 开发者 → 允许 Apple 事件中的 JavaScript」，并通过现有登录会话读取三个平台的实际状态、提交 Google/Bing Sitemap 和完成百度验证。无需复制浏览器用户数据。网页收录及排名仍需在平台后续报告中观察，验证成功与 Sitemap 接收不代表全部网页已编入索引。
