# 部署 60s-web

`60s-web` 是一个 Vite 静态前端项目。你可以直接用 Vercel / Cloudflare 一键部署，也可以用 Docker、Docker Compose 或 Nginx 放到自己的服务器上。

默认 API 地址为 `https://60s.viki.moe/v2`。如需使用自托管 60s API，可在应用内 `设置 -> 默认 API` 替换。

## 一键部署

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdogxii%2F60s-web&project-name=60s-web&repository-name=60s-web">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
  </a>
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/dogxii/60s-web">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
  </a>
</p>

- **Vercel**：点击 `Deploy with Vercel`，导入仓库后即可部署。
- **Cloudflare Workers**：点击 `Deploy to Cloudflare`，可将项目作为静态资源应用快速上线。
- **Docker**：仓库已提供 `Dockerfile`，适合服务器自托管和面板部署。

## Vercel

通过 GitHub 导入项目后，使用以下配置：

```text
Framework Preset: Vite
Install Command: bun install
Build Command: bun run build
Output Directory: dist
```

项目已内置 `vercel.json`，用于指定构建命令、输出目录和 SPA fallback。

也可以使用 Vercel CLI：

```bash
bunx vercel
bunx vercel --prod
```

## Cloudflare Workers

仓库已提供 `wrangler.jsonc`，适合部署为 Cloudflare Workers 静态资源应用。

使用按钮部署：

1. 点击上方 `Deploy to Cloudflare`。
2. 按提示连接 GitHub 仓库。
3. 使用默认配置完成部署。

使用命令行部署：

```bash
bun install
bun run build
bunx wrangler deploy
```

## Cloudflare Pages

在 Cloudflare Dashboard 中进入 `Workers & Pages -> Create application -> Pages`，连接 GitHub 仓库 `dogxii/60s-web` 后使用以下配置：

```text
Framework preset: Vite
Build command: bun run build
Build output directory: dist
Root directory: /
```

建议添加环境变量：

```text
BUN_VERSION=1.1.0
```

如果当前构建环境没有启用 Bun，可以改用 npm：

```text
Build command: npm install && npm run build
Build output directory: dist
```

## Docker

Docker 方案适合：

- 本地快速运行
- 服务器自托管
- 配合 Portainer / 1Panel / Dokploy / CasaOS 等面板部署

构建镜像：

```bash
docker build -t 60s-web .
```

运行容器：

```bash
docker run -d --name 60s-web -p 8080:80 60s-web
```

访问：

```text
http://localhost:8080
```

## Docker Compose

```yaml
services:
  60s-web:
    image: 60s-web
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

启动：

```bash
docker compose up -d
```

## Nginx 静态部署

生成静态文件：

```bash
bun install
bun run build
```

将 `dist/` 上传到服务器，并配置 SPA fallback：

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/60s-web/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 部署检查

- 首页能够正常加载每日简报、热榜、天气和实用数据。
- 页面刷新后仍能保持当前主题、城市、头像和壁纸设置。
- 设置页中 API 检测能够给出连接成功、地址无效或请求失败提示。
- 配置导入导出和恢复默认设置能够正常工作。
- 首页快捷入口收藏能够在刷新后保留，设置页可恢复默认快捷入口。
- 工具页常用接口收藏能够在刷新后保留，并能快速切换到对应接口。
- iPhone Safari 可以添加到主屏幕，打开后显示独立窗口。
- 设置页切换移动端导航模式后，顶部导航和底部导航显示符合预期。
- 新版本 Service Worker 安装后能够显示更新提示并刷新到最新应用壳。
- 断网后应用壳能够打开，API 内容显示现有失败提示。
- 直接访问子路径时能够回退到 `index.html`。
- 如果使用自托管 API，确认浏览器控制台没有跨域错误。
- 如果公开部署，请确认 API 地址可被目标网络访问。
