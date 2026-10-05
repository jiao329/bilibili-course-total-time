# ⏱️ 哔哩哔哩课程总时长统计

> 一键算出整个课程 / 收藏夹 / 播放列表到底要花多少时间，方便安排学习计划。

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Edge](https://img.shields.io/badge/Edge-supported-00a1d6)
![Chrome](https://img.shields.io/badge/Chrome-supported-00a1d6)
![Version](https://img.shields.io/badge/version-1.0.0-green)

打开哔哩哔哩的课程页或收藏夹播放页，插件会自动扫描页面上的视频列表，把所有分 P 的时长加总，
并在页面右上角浮出一个面板，告诉你**总时长**、**视频数量**和**小时数换算**。

全程本地运行：不联网、不上传、不收集任何数据。

---

## 功能特性

| 功能 | 说明 |
| --- | --- |
| 📊 自动统计 | 页面加载完成后自动扫描并累加所有视频时长 |
| 🕐 多格式解析 | 同时支持 `时:分:秒`、`分:秒`、纯秒数三种写法 |
| 🎨 悬浮面板 | 右上角渐变卡片，滑入动画，支持深色模式 |
| 🔄 手动刷新 | 面板底部「点击刷新」可在页面动态加载后重新统计 |
| ✕ 一键关闭 | 不想要的时候随时关掉 |
| 🧭 SPA 适配 | 监听地址栏变化，站内切换页面后自动重新统计 |
| 🪶 零依赖 | 纯原生 JavaScript + CSS，无构建步骤、无第三方库 |

## 效果预览

安装后打开任意课程页面，右上角会出现这样的面板：

```text
┌───────────────────────────────┐
│  ⏱️ 课程总时长             ✕  │
├───────────────────────────────┤
│        12小时 34分 56秒       │
│    共 87 个视频 (12.58 小时)  │
├───────────────────────────────┤
│           点击刷新            │
└───────────────────────────────┘
```

> 想补充真实截图？把截图保存为 `demo.png` 放在仓库根目录，然后把下面这行取消注释即可：
> `<!-- ![功能演示](demo.png) -->`

## 安装方法

### 方法一：开发者模式加载（推荐）

1. 打开 Edge 浏览器，访问 `edge://extensions/`
   （Chrome 请访问 `chrome://extensions/`）
2. 打开左下角 / 右上角的 **开发人员模式**
3. 点击 **加载解压缩的扩展**
4. 选择本项目文件夹 `bilibili-course-total-time`
5. 安装完成，扩展列表中会出现「哔哩哔哩课程总时长统计」

### 方法二：打包安装

1. 在 `edge://extensions/` 页面点击 **打包扩展**
2. 选择本项目文件夹，生成 `.crx` 与 `.pem` 文件
3. 将生成的 `.crx` 文件拖入浏览器完成安装

> 请妥善保管生成的 `.pem` 私钥文件，后续更新版本需要用它签名（已在 `.gitignore` 中忽略，不会提交）。

## 使用方法

1. 打开任意哔哩哔哩课程页面，例如：
   - 课堂页面：`https://www.bilibili.com/cheese/play/...`
   - 收藏夹：`https://www.bilibili.com/medialist/play/...`
   - 播放列表：`https://www.bilibili.com/list/...`
   - 普通视频页：`https://www.bilibili.com/video/BV...`
2. 页面加载完成后约 **2 秒**，右上角自动弹出统计面板
3. 面板显示：课程总时长、视频数量、小时数换算
4. 点击 **点击刷新** 重新统计，点击 **✕** 关闭面板

## 支持的页面类型

| 页面 | 地址特征 | 状态 |
| --- | --- | --- |
| 哔哩哔哩课堂 | `www.bilibili.com/cheese/play/*` | ✅ 支持 |
| 收藏夹播放页 | `www.bilibili.com/medialist/play/*` | ✅ 支持 |
| 播放列表 | `www.bilibili.com/list/*` | ✅ 支持 |
| 视频页 | `www.bilibili.com/video/BV*` | ✅ 支持 |

## 工作原理

1. **注入**：`manifest.json` 声明在 `document_idle` 时机向上述页面注入 `content.js` 与 `style.css`。
2. **等待渲染**：延迟 2 秒执行，等待 B 站前端把课程目录渲染出来。
3. **抓取时长**：先按一组候选选择器收集时长元素，
   例如 `.program-list-item .duration`、`.section-episode-card__duration`、`.video-card .duration` 等。
4. **兜底扫描**：如果一个选择器都没命中，则遍历页面上所有 `span / div / p`，
   用正则 `^\d{1,2}:\d{2}(:\d{2})?$` 匹配纯文本节点，并确认它位于列表容器内，避免把无关数字算进来。
5. **解析累加**：把每个时长换算成秒后求和，再格式化为 `X小时 Y分 Z秒`。
6. **渲染面板**：在 `<body>` 末尾插入固定定位面板，并绑定「刷新」「关闭」事件。
7. **SPA 支持**：用 `MutationObserver` 监听地址变化，站内切换页面后重新统计。

## 项目结构

```text
bilibili-course-total-time/
├── manifest.json     # 扩展清单（Manifest V3）：声明匹配页面、注入脚本与样式
├── content.js        # 核心逻辑：抓取时长 → 解析 → 累加 → 渲染面板
├── style.css         # 面板样式：B 站蓝渐变、滑入动画、深色模式适配
├── icons/
│   └── icon.svg      # 图标源文件（SVG，当前未被 manifest 引用）
└── README.md         # 说明文档
```

## 添加扩展图标（可选）

当前 `manifest.json` 未声明 `icons` 字段，浏览器会使用默认图标。如需自定义图标：

1. 将 `icons/icon.svg` 转换为 PNG，生成 **16×16、48×48、128×128** 三种尺寸
   （在线转换工具：<https://convertio.co/zh/svg-png/>）
2. 把生成的文件放入 `icons/`：`icon16.png`、`icon48.png`、`icon128.png`
3. 在 `manifest.json` 中添加：

```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

4. 回到扩展管理页点击「刷新」重新加载。

## 常见问题

<details>
<summary><b>面板没有出现？</b></summary>

- 确认扩展已在 `edge://extensions/` 中启用
- 确认当前页面地址匹配上面的支持列表
- 等待页面完全加载（约 2–3 秒），部分课程页需要先点开「查看完整课程大纲」
- 按 `F5` 刷新页面，或点击面板上的「点击刷新」
</details>

<details>
<summary><b>统计结果为 0 或数量不对？</b></summary>

B 站前端会不定期调整类名，导致候选选择器失效。请：

1. 按 `F12` 打开开发者工具，在 Console 中查看插件日志（前缀 `[哔哩哔哩总时长统计]`），
   其中会打印本次抓取到的时长明细
2. 在 Elements 面板中查看真实时长元素的类名
3. 把它追加到 `content.js` 中 `cheeseDurationSelectors` 数组里，保存后在扩展页点「刷新」

欢迎提 Issue 反馈失效的页面类型。
</details>

<details>
<summary><b>支持 Chrome / 其他 Chromium 浏览器吗？</b></summary>

支持。本项目使用 Manifest V3，Edge、Chrome、Brave 等 Chromium 内核浏览器均可直接加载。
</details>

<details>
<summary><b>会影响页面性能吗？</b></summary>

影响可以忽略。脚本只在页面加载后执行一次，之后仅在站内切换页面时重新执行一次，
不做轮询、不持续监听 DOM 内容变化。
</details>

## 开发与调试

本项目无需构建，改完代码直接在扩展管理页点击「刷新」按钮即可生效。

- 修改 `content.js` → 刷新扩展 → 刷新 B 站页面 → 打开 Console 查看日志
- 修改 `style.css` → 刷新扩展 → 刷新 B 站页面
- 修改 `manifest.json` → 刷新扩展（匹配规则变更需要重新加载扩展）

## 隐私说明

本插件：

- ✅ 仅在哔哩哔哩相关页面运行（由 `manifest.json` 的 `matches` 限定）
- ✅ 不收集任何用户数据
- ✅ 不发送任何网络请求
- ✅ 不读取、不修改任何账号信息
- ✅ 代码完全开源透明，可自行审阅

## 更新日志

### v1.0.0

- 初始版本
- 支持课程页面时长统计
- 美观的浮动面板显示
- 自动适配多种页面类型

## 开源协议

本仓库当前未指定开源协议。如需允许他人自由使用、修改与分发，建议补充一份
[MIT License](https://choosealicense.com/licenses/mit/)。
