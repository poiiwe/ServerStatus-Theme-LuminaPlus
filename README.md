# ServerStatus Theme LuminaPlus

基于 [LuminaPlus](https://github.com/guboysky/LuminaPlus) 设计、使用 Vue 3 + shadcn/ui + Tailwind CSS 重构的 [ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust) 第三方主题。

界面设计移植自 LuminaPlus，移除了原版中 ServerStatus-Rust 不支持的功能，并做了大量性能与交互优化。

## 特性

- 🌓 **明暗主题**：深色 / 浅色 / 跟随系统三种模式，首屏防闪烁，深色深度可调
- 🧩 **shadcn/ui 组件体系**：组件源码全部在 `src/components/ui/` 下，完全可控、便于二次定制
- 📇 **两种视图**：迷你卡片 / 列表，按地区分组筛选、排序
- 📈 **CPU 记录折线图**：按需开启，懒初始化 + 降采样渲染，多节点同屏不卡顿
- 🌏 **三网延迟/丢包**：电信 / 联通 / 移动分运营商展示（数据来自客户端探测）
- 📱 **响应式**：窄屏自动折列 + 横向滚动，适配手机端
- ♿ **可访问性**：语义化标签、ARIA 属性、键盘可操作

## 构建

```bash
npm install
npm run build   # 产物在 dist/
```

将 `dist/` 内容部署到 ServerStatus-Rust 的 `web/` 目录（或交给 nginx 直接服务）即可，服务端无需任何改动。详见 [DEPLOY](../DEPLOY.md)。

## 部署提示

- ServerStatus-Rust 的默认二进制会把主题**编译时嵌入** `web/` 目录，替换主题需重新编译或用 nginx 托管静态文件
- 主题仅消费 `/json/stats.json` 标准字段，兼容 [zdz/ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust)（三网延迟字段缺失时显示「—」）

## 致谢

- 设计原型：[guboysky/LuminaPlus](https://github.com/guboysky/LuminaPlus)
- 主题框架：[orilights/ServerStatus-Theme-Light](https://github.com/orilights/ServerStatus-Theme-Light)（本项目在其基础上重构）
- 服务端：[zdz/ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust)

## License

[MIT](./LICENSE)
