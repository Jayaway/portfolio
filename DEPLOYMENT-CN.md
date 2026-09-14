# 国内访问方案

网站是纯静态页面，不依赖 Vercel 专属接口。同一套源码可分别部署海外与国内；国内版本需将 `data/site.json` 中背景、封面和作品视频链接换成国内媒体域名。

## 建议架构

- 海外：现有 GitHub → Vercel，保留 songsoc.vercel.app。
- 国内：自有域名 → 阿里云 OSS 中国内地地域静态托管 → HTTPS；需要时再接 CDN。
- 视频：初期将压缩后的 MP4 与 WebP 封面放在 OSS，通过自己的媒体域名访问。作品变多、长片增多后再接入视频点播与多码率分发。
- 字体：当前全部使用系统字体，无 Google Fonts 等第三方字体请求。
- 不将网盘分享页作为视频源；避免将长视频放进 Git 仓库。

## 实施步骤

1. 准备自有域名和阿里云账号。中国内地 OSS 绑定的域名需要完成 ICP 备案；备案、域名实名及账号主体信息必须由所有人提供。
2. 创建静态站点专用 OSS Bucket，按官方静态托管文档配置公开访问，默认首页设为 `index.html`。不要混用存放私密文件的 Bucket。
3. 在本项目运行 `python3 scripts/package-site.py`，仅上传 `dist/` 内的文件。不要上传 `.git`、本地凭据或整个工作目录。
4. 绑定自定义域名，按控制台给出的目标配置 DNS，并配置 HTTPS。
5. 将有权公开的背景与作品视频上传到媒体存储，配置正确的 MIME 类型（如 video/mp4）、支持 Range 请求，并将真实 URL 填入 `data/site.json`。先转码适合网页播放的 H.264/AAC MP4，开启 faststart；短背景无音轨且控制体积。
6. 更新国内配置后重新导出并上传，保留同名相对路径。HTML 与配置采用短缓存或重新验证；带版本号的图片和视频可长期缓存。
7. 在国内移动、电信、联通网络实际验证首页、拖帧、作品播放、HTTPS 与邮件入口。不要用海外单点检测代替国内实测。

## 暂无备案域名

可先使用港澳台或海外地域托管作为过渡，但跨境链路不等于中国内地加速，访问体验需要实测。国内正式商用展示更适合自有域名与内地存储。

## 费用与当前状态

费用主要由存储、视频下行流量、CDN 与域名构成，按实际报价和访问量确认，不在无预算的情况下开通付费服务。当前只准备了可上传的网站文件和实施方案，未创建国内云资源、购买域名或完成备案。

## 官方依据

- OSS 静态网站托管：https://help.aliyun.com/zh/oss/user-guide/hosting-static-websites
- OSS 自定义域名：https://help.aliyun.com/zh/oss/user-guide/access-buckets-via-custom-domain-names
- Vercel GitHub 发布：https://vercel.com/docs/git/vercel-for-github
