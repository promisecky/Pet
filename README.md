# Pet Health - 智能宠物健康管家

![Pet Health Banner](https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=1200&h=400)

Pet Health 是一个现代化的宠物健康管理平台，旨在帮助宠物主人更好地管理毛孩子的日常生活、健康数据和智能设备。

## 🚀 功能特性

- **📊 仪表盘**: 
  - 实时查看今日待办任务队列（支持任务完成、自动补位）。
  - 宠物体重趋势图表分析。
  - 快速状态记录（开心、玩耍、睡觉）。
- **🐾 宠物管理**: 
  - 多宠物档案切换。
  - 详细的宠物信息记录（品种、体重、绝育状态、病史等）。
  - **支持头像上传**与预览。
  - 完整的增删改查（CRUD）功能。
- **📅 健康计划**: 制定科学的饮食和运动计划（开发中）。
- **📱 设备控制**: 智能喂食器与饮水机管理（开发中）。
- **🔐 用户认证**: 模拟登录与注册流程。

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS + Lucide React (图标)
- **状态管理**: Zustand
- **图表组件**: Recharts
- **路由管理**: React Router DOM
- **后端/存储**: Supabase (目前前端使用 Mock Data 模拟 API 响应)

## 📂 项目结构

```
frontend/
├── src/
│   ├── components/    # 公共组件 (Layout 等)
│   ├── pages/         # 页面视图 (Dashboard, PetProfile, Login 等)
│   ├── lib/           # 工具库
│   │   ├── api.ts     # API 接口封装 (包含 Mock 数据逻辑)
│   │   └── supabase.ts # Supabase 客户端配置
│   ├── store.ts       # Zustand 全局状态管理
│   ├── types/         # TypeScript 类型定义
│   └── App.tsx        # 路由配置
└── ...
```

## ⚡ 快速开始

### 1. 环境准备
确保您的本地已安装 [Node.js](https://nodejs.org/) (推荐 v16+)。

### 2. 安装依赖
进入前端目录并安装依赖：

```bash
cd frontend
npm install
```

### 3. 配置环境变量
在 `frontend` 目录下创建 `.env` 文件（如果没有）：

```env
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder-key
```
> 注意：目前项目主要运行在 Mock 模式下，上述配置仅防止报错，无需真实连接 Supabase。

### 4. 启动开发服务器

```bash
npm run dev
```

浏览器访问 [http://localhost:5173](http://localhost:5173) 即可查看效果。

## 📝 接口说明 (Mock Mode)

目前 `src/lib/api.ts` 实现了前端模拟接口，拦截了原本发往后端的请求。

### Auth
- `POST /auth/login`: 模拟登录，返回固定用户信息。
- `POST /auth/register`: 模拟注册。

### Pets
- `GET /pets?userId={id}`: 获取用户的所有宠物列表。
- `POST /pets`: 创建新宠物。
- `PUT /pets/{id}`: 更新宠物信息。
- `DELETE /pets/{id}`: 删除宠物。

## 🎨 数据模型

核心数据类型定义在 `src/types/index.ts`：

```typescript
type Pet = {
  id: string
  name: string
  species: 'cat' | 'dog'
  breed?: string
  weight?: number
  gender?: 'male' | 'female'
  is_neutered: boolean
  medical_history?: string
  avatar_url?: string  // Base64 图片字符串
}
```

## 📄 待办事项 / 开发计划

- [ ] 集成真实的 Supabase 后端认证与数据库。
- [ ] 完善健康计划生成算法。
- [ ] 对接实际的 IoT 设备 MQTT 协议。
- [ ] 移动端 PWA 适配优化。

---

© 2024 Pet Health Team. All rights reserved.
