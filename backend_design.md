# 数据库设计与后端架构详细说明文档

> **注意**: 本文档描述的是**目标后端架构 (Target Architecture)**。
> **当前状态**: 前端目前使用 `src/lib/api.ts` 中的 Mock Adapter 模拟了本设计中的核心接口。
> **最后更新**: 2026-03-10

## 1. 设计理念 (Design Philosophy)

本系统后端设计遵循 **Clean Architecture (整洁架构)** 原则，核心目标是实现 **高内聚低耦合**，确保业务逻辑与具体的技术实现分离。

### 1.1 当前 Mock 实现策略
在 MVP 阶段，为了快速验证前端业务逻辑，我们在前端 `src/lib/api.ts` 中实现了一个 **API Adapter**。它模拟了下述的 Service/Repository 层，使得前端组件无需感知后端是否真实存在。

- **接口一致性**: Mock API 的输入输出格式与本文档定义的 API 规范保持一致。
- **无缝迁移**: 未来接入真实后端时，只需修改 `api.ts` 中的 `fetch` 逻辑，无需改动 UI 组件。

## 2. 数据库详细设计 (Target Schema)

本设计采用关系型数据库（PostgreSQL），但字段类型和命名保持通用性。

### 2.1 用户与权限 (Identity & Access)

#### `users` 表
存储用户的核心认证信息。
| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | 用户唯一标识 | PK |
| `email` | VARCHAR(255) | 邮箱/账号 | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | 密码哈希值 (如 bcrypt) | NOT NULL |
| `phone` | VARCHAR(20) | 手机号 | UNIQUE, NULLABLE |
| `role` | VARCHAR(20) | 角色 (user, admin) | DEFAULT 'user' |
| `created_at` | TIMESTAMP | 创建时间 | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | 更新时间 | |

#### `profiles` 表
存储用户的非敏感个人信息，与 `users` 表 1:1 关联。
| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | 关联用户ID | PK, FK -> users.id |
| `nickname` | VARCHAR(50) | 昵称 | |
| `avatar_url` | TEXT | 头像链接 | |
| `preferences` | JSONB | 用户偏好设置 (如通知开关) | DEFAULT '{}' |

### 2.2 核心业务数据 (Core Business)

#### `pets` 表
存储宠物档案。
> **Mock 实现注记**: 当前前端使用 Base64 字符串模拟 `avatar_url` 存储。
| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | 宠物唯一标识 | PK |
| `user_id` | UUID | 所属用户 | FK -> users.id |
| `name` | VARCHAR(50) | 宠物昵称 | NOT NULL |
| `species` | VARCHAR(20) | 物种 (cat, dog) | NOT NULL |
| `breed` | VARCHAR(50) | 品种 | |
| `gender` | VARCHAR(10) | 性别 (male, female) | |
| `birth_date` | DATE | 出生日期 | |
| `weight` | DECIMAL(5,2) | 当前体重 (kg) | |
| `is_neutered` | BOOLEAN | 是否绝育 | DEFAULT FALSE |
| `medical_history` | TEXT | 既往病史 | |
| `avatar_url` | TEXT | 宠物头像 | |
| `created_at` | TIMESTAMP | 创建时间 | |

#### `health_plans` 表
存储 AI 生成的健康计划。
| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | 计划唯一标识 | PK |
| `pet_id` | UUID | 关联宠物 | FK -> pets.id |
| `goal_type` | VARCHAR(20) | 目标 (lose_weight, gain_weight, maintain) | NOT NULL |
| `target_weight` | DECIMAL(5,2) | 计划目标体重 | |
| `daily_calories` | INTEGER | 每日建议卡路里 | |
| `feeding_schedule` | JSONB | 喂食时间表 ([{time: "08:00", amount: 50}]) | |
| `exercise_plan` | TEXT | 运动建议 | |
| `status` | VARCHAR(20) | 状态 (active, archived) | DEFAULT 'active' |
| `created_at` | TIMESTAMP | 生成时间 | |

## 3. 接口与交互设计 (API Design)

所有接口统一前缀 `/api/v1`。

### 3.1 认证模块 (Auth)
- `POST /auth/register`: 注册 (email, password)
- `POST /auth/login`: 登录 (email, password) -> 返回 JWT
- `POST /auth/logout`: 登出
- `GET /auth/me`: 获取当前用户信息

### 3.2 宠物模块 (Pet)
> **前端 Mock 实现**: 对应 `src/lib/api.ts` 中的 `api.pets` 对象。
- `GET /pets`: 获取当前用户的所有宠物
- `POST /pets`: 创建新宠物
- `PATCH /pets/:id`: 更新宠物信息 (包含状态更新)
- `DELETE /pets/:id`: 删除宠物

### 3.3 计划模块 (Plan)
- `POST /plans/generate`: 请求 AI 生成计划
- `POST /plans/confirm`: 确认并保存计划
- `GET /plans/current?pet_id=xxx`: 获取当前生效计划

### 3.4 设备模块 (Device)
- `GET /devices`: 获取设备列表
- `POST /devices`: 绑定新设备
- `POST /devices/:id/control`: 控制设备 (feed, water)

## 4. 安全策略 (Future Implementation)
当迁移至真实后端时，需实施以下策略：
- **RLS (Row Level Security)**: 在数据库层强制检查 `auth.uid() = user_id`。
- **JWT 验证**: 所有受保护接口必须验证 Authorization Header。
- **输入校验**: 使用 Zod 或类似库在后端再次校验所有输入数据。
