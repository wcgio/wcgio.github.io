# hexo-blog

静海潜蛟的个人博客 —— 记录技术、生活与思考。

- 站点：https://blog.wcg.qzz.io
- 生成器：[Hexo](https://hexo.io/) 8.x
- 主题：hexo-theme-stellar + hexo-pro 后台

## 本地开发

```bash
npm install
npm run server        # http://localhost:4000
npm run build         # 生成静态文件到 public/
npm run deploy        # 部署（见 deploy_config.json）
```

## 目录说明

| 路径 | 说明 |
| --- | --- |
| `source/_posts/` | 文章 |
| `source/_data/` | 主题数据配置（widgets、wiki 等） |
| `_config.yml` | Hexo 主配置 |
| `_config.stellar.yml` | Stellar 主题配置 |
| `scripts/` | 自定义构建脚本 |

## 部署

`deploy_config.json` 配置 GitHub / Cloudflare Pages 双通道部署（含密钥，已忽略提交），
`scripts/seo.js` 负责生成 sitemap、robots 与搜索引擎推送。
