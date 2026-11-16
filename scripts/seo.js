'use strict';

// Keep webmaster verification values in the site config, outside the theme.
const escapeAttribute = value => String(value).replace(/[&"<>]/g, character => ({
  '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'
})[character]);

hexo.extend.filter.register('after_generate', async function () {
  const base = new URL(hexo.config.url);
  const verification = hexo.config.webmaster_verification || {};
  const names = {
    google: 'google-site-verification',
    bing: 'msvalidate.01',
    baidu: 'baidu-site-verification'
  };
  const tags = Object.entries(names)
    .filter(([key]) => typeof verification[key] === 'string' && verification[key].trim())
    .map(([key, name]) => `<meta name="${name}" content="${escapeAttribute(verification[key].trim())}">`)
    .join('\n');

  for (const path of hexo.route.list().filter(path => path.endsWith('.html'))) {
    const stream = hexo.route.get(path);
    let html = '';
    for await (const chunk of stream) html += chunk.toString();
    const original = html;
    const noindex = path === '404.html' || path === 'settings/index.html';
    const canonical = new URL(path.replace(/index\.html$/, ''), `${base.href.replace(/\/$/, '')}/`).href;

    if (noindex) {
      html = html.replace(/<link\b(?=[^>]*\brel="canonical")[^>]*>\s*/gi, '');
      html = html.replace(/<meta\b(?=[^>]*\bname="robots")[^>]*>\s*/gi, '');
      html = html.replace('</head>', '<meta name="robots" content="noindex, follow" data-stellar-page-meta="">\n</head>');
    } else {
      // Stellar's generated listing pages may inherit the home canonical.
      html = html.replace(/(<link\b(?=[^>]*\brel="canonical")[^>]*\bhref=")([^"]+)(")/gi,
        (match, prefix, href, suffix) => href.replace(/\/$/, '') === base.href.replace(/\/$/, '')
          ? `${prefix}${escapeAttribute(canonical)}${suffix}` : match);
    }
    if (tags) html = html.replace('</head>', `${tags}\n</head>`);
    if (html !== original) hexo.route.set(path, html);
  }
});
