# 窝囊费

小红书离线小工具，把工资收入估算变成看得见的进度和逐渐点亮的小目标。当前代码版本为 **1.1.0**。

下一版方案见 [1.2.0 产品需求方案](docs/PRD-v1.2.0.md)。四项核心能力仍在规划；[电脑 H5 悬浮小窗](docs/feedback/desktop-floating-window.md)已实现并通过预览确认，本次更新仅面向电脑 H5，手机和小红书版保持现状。

## 功能

- 金额与脱敏展示：查看今日收入，或通过物品插画逐渐点亮来展示进度。
- 全天与仅工作时间：统一每日目标为月薪 ÷ 当月自然日；全天按 24 小时累计，仅工作按设定时长累计，休息日不计。
- 965、10105、996 作息卡片，双休/单休和午休快捷选择。
- 最近种草：编辑、优先排序、攒够点亮、已买到归档，已花费金额不重复分配。
- 修改工资与模式时保留累计愿望基金，支持当天休息/调休工作覆盖。
- 文字/振动提醒：每天最多 3 次、间隔至少 60 分钟，可关闭。
- 首次引导与分享小票；本地保存设置，不依赖自建服务。

## 运行与检查

需要 Node.js 18+ 和 Python 3，测试和打包无需第三方依赖。

```sh
npm test
npm run build
```

构建结果为 `build/wonangfei-v1.1.0.zip`，根目录直接包含 `index.html`。`build` 只负责结构、扩展名和包体检查；发布前仍需按当前小红书小工具开发规范完成合规审计。

开发时，在安装并验证官方 redapp CLI 后运行：

```sh
redapp dev --dir ./dist --no-open --agent
```

该命令需要 Node.js 20+，首次会安装模拟器依赖。普通浏览器预览不能替代小红书模拟器和真机验收。

## 目录

- `dist/`：直接运行及上传的 HTML、CSS、经典 JavaScript 和能力标记。
- `tests/`：收入、基金迁移、工作日覆盖、提醒频控、脱敏锚点检查。
- `scripts/build.py`：离线 ZIP 打包。
- `assets/`：发布图标和封面，独立于小工具运行包。

## 计算与边界

收入和基金均为估算，不代表实际工资到账或真实存款。工作时间不自动识别法定节假日、调休或加班倍数；可调整当天工作安排。目前不支持跨夜班。

脱敏商品使用随包 SVG 插画，并非官方商品照片。当前内置30件小目标、15件月薪级大目标，价格为参考价，不是实时市场报价。用户自己的未购买目标优先。

数据通过小红书本地缓存 API 保存，旧环境兼容浏览器存储；卸载、清理缓存等可能导致数据丢失。关闭小工具后无后台通知；再次打开会按时间重新计算。

## 发布

入口：<https://creator.xiaohongshu.com/new/red-app>

上传、生成手机预览、确认通过后再送审。仓库不保存账号凭证、预览二维码、远端文件回执或本地会话记录。Android/iOS 真机兼容性与性能仍需验证。


## H5 / Cloudflare Pages

`npm run build:h5` generates the independent browser version in `h5/`; the submitted mini-tool `dist/` stays unchanged. `h5/web.js` adapts image sharing/downloading and browser vibration. H5 uses a separate browser storage key, no account, no server and no salary uploads.

The Pages project name is `wonangfei`, with requested production URL `https://wonangfei.pages.dev` (subject to Cloudflare availability). After Wrangler login:

```sh
npm run build:h5
npx wrangler pages project create wonangfei --production-branch main
npx wrangler pages deploy h5 --project-name wonangfei --branch main
```

Create the project only once; subsequent deployments reuse it. Local H5 preview: `python3 -m http.server 50880 --bind 127.0.0.1 --directory h5`.

桌面浏览器支持 Document Picture-in-Picture 时，首页下方会出现「悬浮小窗」。先保存工资与作息并退出演示，再点击打开。小窗显示今日估算收入或当前愿望解锁进度，脱敏偏好与主页同步；保留来源网页，小窗才能继续运行。浏览器窗口控件可移动、调整大小或关闭小窗，关闭不暂停计薪。手机不增加入口。

`h5/floating.js`、`h5/floating.css` 是浏览器专用视图，构建器只在 H5 中注入只读快照桥，不修改 `dist/`。小窗按当前时间重绘，不写存储、不单独累加收入或触发业务提醒。`npm test` 包含相应生命周期与隐私测试。


## 首批好物版本 1.1.0

内置30件小目标、15件月薪级大目标，完整清单见 [首批好物清单](docs/first-batch-catalog.md)。金额页支持今天/本月切换，本月按当前设置从1日回算；愿望基金独立累计。脱敏页百分比与参考价同一行，H5点击价格打开什么值得买，小红书端展示来源地址。已去掉优惠条件入口。商品价格是单件参考价，不计凑单、返卡、积分等收益，不承诺实时库存或历史最低价。
