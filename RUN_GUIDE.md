# Pet Health - 项目启动与交接指南

本指南旨在帮助新开发者快速搭建环境、运行项目并了解核心配置。

## 🛠️ 环境准备 (Prerequisites)

请确保您的本地开发环境已安装以下工具：

- **Node.js**: v18.x (LTS) 或更高版本。
- **Java**: JDK 17 (Spring Boot 3.2 运行环境)。
- **Maven**: v3.9+ (后端依赖管理)。
- **MySQL**: v8.0+ (数据库存储)。

---

## 🚀 第一步：启动数据库 (Database)

本项目采用**独立数据目录挂载**的方式启动 MySQL，确保您的数据与系统环境隔离。

1. **进入项目根目录**:
   ```powershell
   cd Pet
   ```

2. **启动 MySQL 服务 (PowerShell)**:
   ```powershell
   # 启动数据库并挂载项目内的 mysql-data 目录
   # 注意：请根据您的实际安装路径调整 -FilePath 和 --basedir 参数
   Start-Process -FilePath "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" -ArgumentList "--basedir=`"C:\Program Files\MySQL\MySQL Server 8.4`" --datadir=`"$PWD\mysql-data`"" -WindowStyle Hidden
   ```

3. **创建数据库**:
   登录 MySQL 并执行以下 SQL：
   ```sql
   CREATE DATABASE pet_health CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *后端 JPA 会在启动时自动根据实体类创建表结构。*

---

## 🚀 第二步：启动后端服务 (Backend)

1. **进入后端目录**:
   ```powershell
   cd backend
   ```

2. **配置 AI API Key**:
   打开 `src/main/resources/application.properties`，填入您的通义千问 API Key：
   ```properties
   ai.dashscope.api-key=your_api_key_here
   ```

3. **编译并运行**:
   ```powershell
   mvn spring-boot:run
   ```
   后端服务将监听 [http://localhost:8080](http://localhost:8080)。

---

## 🚀 第三步：启动前端应用 (Frontend)

1. **进入前端目录**:
   ```powershell
   cd frontend
   ```

2. **安装依赖**:
   ```powershell
   npm install
   ```

3. **配置环境变量**:
   检查 `.env` 文件，确保其配置为后端模式：
   ```env
   VITE_API_MODE=backend
   VITE_API_BASE=http://localhost:8080/api
   ```

4. **启动开发服务器**:
   ```powershell
   npm run dev
   ```
   访问 [http://localhost:5173](http://localhost:5173)。

---

## 📂 核心文件索引 (Key Files)

| 功能模块 | 文件路径 | 说明 |
| :--- | :--- | :--- |
| **API 接口层** | `frontend/src/lib/api.ts` | 统一管理所有与后端的通信。 |
| **状态同步** | `frontend/src/store.ts` | Zustand 管理全局宠物及任务状态。 |
| **AI 逻辑** | `backend/src/main/java/.../service/HealthPlanService.java` | 负责 AI Prompt 生成与任务固化。 |
| **表结构** | `database_schema.sql` | 数据库表结构全量导出。 |
| **数据库设计** | `DATABASE_DESIGN.md` | 详细的表字段说明与 ER 关系图。 |

## ❓ 常见问题排查 (Troubleshooting)

- **注册/登录失败**: 请检查 `backend` 控制台输出。常见原因是数据库连接失败或 `8080` 端口被占用。
- **AI 计划无法生成**: 检查 DashScope API Key 是否有效，或检查网络是否能访问阿里云接口。
- **数据不一致**: 刷新页面。如果任务没有根据计划更新，请检查 `HealthPlanService` 中的 `createOrUpdatePlan` 逻辑。

---
**祝您的开发过程愉快！如果有任何问题，请查阅 [technical_architecture.md](./technical_architecture.md)。**
