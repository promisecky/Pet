# 宠物健康计划 Web - 技术架构文档

> **当前状态**: 前端独立部署版 (Mock Backend)
> **最后更新**: 2026-03-10

## 1. 系统架构图 (Current MVP)

目前采用**前端优先 (Frontend-First)** 策略，通过 Mock Adapter 模拟后端交互，实现快速迭代与演示。

```mermaid
graph TD
    User[用户 (Web/Mobile)] -->|HTTPS| Vercel[Vercel Edge Network]
    Vercel -->|Serve| Frontend[前端应用 (React SPA)]
    
    subgraph "Frontend Layer"
        Page[页面组件 (Dashboard/Profile)]
        Store[状态管理 (Zustand)]
        MockAPI[API Adapter (src/lib/api.ts)]
    end
    
    Page -->|Action| Store
    Store -->|Async| MockAPI
    MockAPI -->|Simulate| MockData[本地内存数据]
    
    subgraph "Future Backend (Planned)"
        Supabase[Supabase (Auth/DB)]
        AI_Service[AI Model (LLM)]
    end
    
    MockAPI -.->|Future Switch| Supabase
```

## 2. 技术栈选型

### 2.1 前端 (Frontend)
- **核心框架**: React 18 + Vite 5
- **语言**: TypeScript 5.x
- **样式方案**: 
  - **Tailwind CSS 3.4**: 原子化 CSS，快速构建响应式布局。
  - **clsx / tailwind-merge**: 动态类名管理。
- **图标库**: Lucide React (轻量、统一风格)
- **状态管理**: Zustand (轻量级全局状态管理，替代 Redux/Context)
- **路由**: React Router DOM v6
- **数据可视化**: Recharts (响应式图表)
- **动画**: CSS Transitions + Tailwind Animate

### 2.2 模拟后端 (Mock Backend Strategy)
为了在没有真实后端的情况下进行全功能开发，我们实现了 **Mock Adapter Pattern**：
- **位置**: `src/lib/api.ts`
- **机制**: 拦截所有的业务请求（Auth, Pets, Plans）。
- **数据**: 使用 `setTimeout` 模拟网络延迟，返回符合接口定义的 Mock JSON 数据。
- **优势**: 
  - 前端开发不阻塞。
  - 演示环境零部署成本。
  - 接口定义稳定后，只需替换 `api.ts` 内部实现即可无缝切换到真实 Supabase 后端。

### 2.3 部署 (Deployment)
- **平台**: Vercel
- **流程**: GitHub Push -> Vercel Build -> Edge Deployment
- **构建命令**: `npm run build` (tsc + vite build)

## 3. 数据流设计

### 3.1 状态管理 (Store)
使用 Zustand 创建单一数据源 `useStore`：
- **User Slice**: 管理登录用户信息、Token。
- **Pet Slice**: 管理宠物列表、当前选中的宠物 ID。
- **Actions**: `login`, `logout`, `setPets`, `addPet`, `updatePet`, `deletePet`。

### 3.2 头像处理
由于没有对象存储服务 (S3/OSS)，目前头像采用 **Base64** 方案：
1. 用户选择本地图片。
2. 前端 `FileReader` 读取为 Data URL (Base64)。
3. 存入 `formData.avatar_url`。
4. 在应用生命周期内保持在内存/Mock数据中。
> *未来规划：上传至 Supabase Storage，数据库仅存 URL。*

## 4. 目录结构规范

```
frontend/src/
├── components/    # 通用 UI 组件 (Buttons, Layouts)
├── pages/         # 路由页面 (Dashboard, Login)
├── hooks/         # 自定义 Hooks (useTheme)
├── lib/           # 核心逻辑库
│   ├── api.ts     # ★ API 适配层 (Mock 实现)
│   ├── supabase.ts # Supabase 客户端 (预留)
│   └── utils.ts   # 工具函数 (Class合并等)
├── types/         # TypeScript 类型定义 (Pet, User, Task)
├── store.ts       # 全局状态 Store
└── ...
```

## 5. 安全策略 (Mock 版)
- **鉴权模拟**: 登录接口返回虚构 Token，前端通过检查 `user` 对象是否存在来判断登录状态。
- **路由保护**: `App.tsx` 中使用 `<Navigate>` 组件保护私有路由（如 `/`, `/pets`），未登录自动跳转 `/login`。
