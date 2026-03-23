# Pet Health - 技术架构文档

> **当前状态**: 前后端集成部署版
> **最后更新**: 2026-03-23

## 1. 系统架构图

本项目采用**前后端分离 (Frontend-Backend Decoupling)** 架构，通过 RESTful API 进行交互。

```mermaid
graph TD
    User[用户 (Web/Mobile)] -->|HTTPS| Frontend[前端应用 (React SPA)]
    
    subgraph "Frontend Layer"
        Page[页面组件 (Dashboard/Profile/Plan)]
        Store[状态管理 (Zustand)]
        API_Layer[API Client (src/lib/api.ts)]
    end
    
    Frontend --> API_Layer
    API_Layer -->|RESTful Request| Backend[后端服务 (Spring Boot)]
    
    subgraph "Backend Layer"
        Controller[REST Controller]
        Service[Service Logic]
        Repo[JPA Repository]
        AI_Integration[DashScope AI Integration]
    end
    
    Backend -->|SQL| MySQL[(MySQL Database)]
    Backend -->|SDK| DashScope[阿里云通义千问]
```

## 2. 技术栈详解

### 2.1 前端 (Frontend)
- **React 18**: 使用函数式组件与 Hooks (useEffect, useState)。
- **TypeScript**: 全面类型检查，定义在 `src/types/index.ts`。
- **Zustand**: 轻量级全局状态管理，负责处理用户、宠物及**实时任务列表**的跨页面同步。
- **Tailwind CSS**: 原子化样式，响应式布局。
- **Recharts**: 用于渲染宠物体重近 7 天的变化趋势。
- **Lucide React**: 统一图标库。

### 2.2 后端 (Backend)
- **Spring Boot 3.2**: 核心 Java 开发框架。
- **Spring Data JPA**: 基于 Hibernate 实现的数据库持久化，自动根据实体类管理表结构。
- **DashScope SDK**: 集成阿里云通义千问模型，实现 AI 宠物健康计划生成。
- **Lombok**: 简化 Java 代码，自动生成 Getter/Setter。

### 2.3 数据库 (Database)
- **MySQL 8.4**: 数据存储。
- **隔离性设计**: 本项目使用独立的 `mysql-data` 目录进行挂载，避免与系统原生 MySQL 配置冲突。

## 3. 核心业务流程

### 3.1 账号注册与登录 (Auth Flow)
1. 前端通过 `api.auth.register` 发送请求。
2. 后端校验邮箱唯一性，存入 `users` 表。
3. 登录后，后端返回 Mock JWT Token 和用户信息，前端将其存入 Zustand Store 和 LocalStorage（可选）。

### 3.2 AI 计划同步 (AI Plan Synchronization)
1. 用户在“健康计划”页点击“生成计划”。
2. 后端 `HealthPlanService` 调用通义千问 AI，获取包含喂食、运动、加水等详细任务的 JSON 结果。
3. **数据固化**: 后端将生成的计划保存到 `health_plans` 表，并同步在 `tasks` 表中创建今日任务。
4. **前端响应**: 前端接收到成功响应后，通过全局 Store 更新 `tasks`，确保仪表盘实时展示新生成的任务。

## 4. 关键文件说明

- **[api.ts](file:///c:/Users/Bruce/Desktop/yourHealthPet/Pet/frontend/src/lib/api.ts)**: 统一的 API 请求层，基于 `fetch` 封装，负责与后端通信。
- **[store.ts](file:///c:/Users/Bruce/Desktop/yourHealthPet/Pet/frontend/src/store.ts)**: 前端单一数据源，管理宠物状态和任务。
- **[PetHealthApplication.java](file:///c:/Users/Bruce/Desktop/yourHealthPet/Pet/backend/src/main/java/com/pethealth/PetHealthApplication.java)**: 后端入口文件。
- **[HealthPlanService.java](file:///c:/Users/Bruce/Desktop/yourHealthPet/Pet/backend/src/main/java/com/pethealth/service/HealthPlanService.java)**: AI 核心逻辑，负责 Prompt 构建与任务自动同步。

## 5. 扩展性建议

1. **真实鉴权**: 当前 Token 为 Mock，交接后建议集成 Spring Security + JWT 真实鉴权。
2. **对象存储**: 目前头像采用 Base64，建议交接后集成阿里云 OSS 或 AWS S3。
3. **消息推送**: 建议增加 WebSocket 实现喂食提醒。
