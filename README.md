# 李金凇 · 代码与影像

个人简介、开发项目与商业拍摄／剪辑作品集。原生 HTML / CSS / JavaScript，无运行时依赖。

## 本地预览

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

访问 http://127.0.0.1:8765 。请使用 HTTP 服务，不直接双击 HTML，作品配置通过 fetch 加载。

## 添加真实视频作品

编辑 `data/site.json` 的 `films`。没有作品时显示“作品集整理中”；不会发布示例客户或虚构作品。

```json
{
  "title": "填写真实作品名称",
  "category": "商业拍摄",
  "role": "拍摄 / 剪辑",
  "year": "2026",
  "description": "填写项目背景、职责与实际交付内容",
  "poster": "media/your-film-cover.webp",
  "src": "https://你的媒体域名/your-film.mp4"
}
```

将对象放进 `films` 数组。`src` 必须是浏览器可播放的直链（建议 H.264/AAC MP4），不是网盘分享页或视频网站播放页。视频仅在点击作品后请求；关闭弹窗停止并释放视频。封面按需加载。第一件作品为宽幅主作品，其余为双列，手机单列。只有已获公开展示授权的真实作品才应添加。

背景配置为 `background.src` / `background.poster`。当前背景为原始红色小人设计参考素材，视频与首帧保存在 `media/` 并随网站托管，与个人作品列表分离。可替换为自己的短视频。背景支持桌面鼠标拖帧、触屏滚动拖帧、暂停与系统减少动态效果。网络故障时保留静态背景与完整内容。

## 发布

仓库 main 已连接 Vercel。推送后由 Vercel 自动构建并更新现有生产项目。

```sh
python3 scripts/package-site.py
```

只将公开页面、样式、脚本和媒体配置导出到 `dist`。国内静态托管同样上传该目录内容，详见 `DEPLOYMENT-CN.md`。
