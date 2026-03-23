# Pet Health - 智能宠物健康管家

![Pet Health Banner](https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=1200&h=400)

Pet Health 是一个现代化的宠物健康管理平台，旨在帮助宠物主人通过 AI 驱动的科学建议，更好地管理毛孩子的日常生活、健康数据。

## 🚀 功能特性

- **📊 仪表盘**: 
  - **动态任务队列**: 支持上下滑动查看所有任务（如喂食、加水、运动）。
  - **实时状态切换**: 快速记录宠物的当前心情（开心、玩耍、睡觉）。
  - **体重趋势图**: 基于近 7 天数据的动态折线图。
- **🐾 宠物管理**: 
  - 多宠物档案切换与管理。
  - 详细的健康档案（品种、体重、绝育状态等）。
  - **支持头像上传**: 本地 Base64 存储与预览。
- **📅 健康计划 (AI 驱动)**: 
  - 基于通义千问 (Qwen-Plus) AI 模型生成个性化计划。
  - **自动同步**: 生成的计划会自动转换为仪表盘的“今日任务”，实现闭环管理。
- **🔐 用户体系**: 完整的注册与登录流程，支持昵称自定义。

## 🛠️ 技术栈

### 前端 (Frontend)
- **核心框架**: React 18 + TypeScript + Vite
- **样式方案**: Tailwind CSS + Lucide React (图标)
- **状态管理**: Zustand (全局状态同步)
- **图表组件**: Recharts
- **路由管理**: React Router DOM v6

### 后端 (Backend)
- **核心框架**: Spring Boot 3.2 (Java 17)
- **数据存储**: MySQL 8.0+
- **持久层**: Spring Data JPA
- **AI 接口**: 阿里云 DashScope (通义千问 SDK)

## 📂 项目结构

```text
Pet/
├── frontend/             # 前端 React 项目
│   ├── src/
│   │   ├── pages/        # Dashboard, HealthPlan, Login 等页面
│   │   ├── lib/api.ts    # 核心 API 请求层 (已移除 Mock)
│   │   ├── store.ts      # Zustand 全局状态定义
│   │   └── types/        # TypeScript 类型定义
├── backend/              # 后端 Spring Boot 项目
│   ├── src/main/java/    # 控制器、服务、实体类
│   └── src/main/resources # 配置文件
├── mysql-data/           # 数据库持久化目录 (挂载使用)
├── RUN_GUIDE.md          # ★ 详细的启动与配置指南
├── API_DOC.md            # ★ 接口定义文档
├── DATABASE_DESIGN.md    # ★ 数据库设计文档
└── database_schema.sql   # 数据库表结构脚本
```

## ⚡ 快速上手

请参考根目录下的 [RUN_GUIDE.md](./RUN_GUIDE.md) 进行环境配置和项目启动。

### 核心步骤简述
1. **启动数据库**: 运行项目根目录下的 MySQL 启动指令。
2. **启动后端**: 在 `backend` 目录下执行 `mvn spring-boot:run`。
3. **启动前端**: 在 `frontend` 目录下执行 `npm install` 和 `npm run dev`。

## 🎨 开发与交接注意事项

1. **接口同步**: 前端 `src/lib/api.ts` 是唯一的接口入口，已完全切换为真实后端模式。
2. **AI 配置**: 后端 AI 计划生成依赖 DashScope API Key，请在 `application.properties` 中配置。
3. **数据一致性**: 仪表盘的任务列表已通过 Zustand 实现与健康计划页面的全局实时同步。

---
*Created with care for our furry friends.*
