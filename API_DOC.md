# Pet Health - API 接口文档

> **基础 URL**: `http://localhost:8080/api`
> **请求协议**: RESTful (JSON)

---

## 1. 用户认证 (Auth)

### 1.1 注册
- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "nickname": "宠物主人"
  }
  ```
- **Response (200 OK)**: 返回注册成功的 User 对象。

### 1.2 登录
- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "fake-jwt-token-uuid",
    "user": { ...userObject }
  }
  ```

---

## 2. 宠物管理 (Pets)

### 2.1 获取宠物列表
- **URL**: `/pets`
- **Method**: `GET`
- **Query Params**: `userId={uuid}`
- **Response**: `Pet[]`

### 2.2 创建宠物
- **URL**: `/pets`
- **Method**: `POST`
- **Request Body**: `Pet` 对象 (不含 ID)

### 2.3 更新宠物状态
- **URL**: `/pets/{id}`
- **Method**: `PUT`
- **Description**: 用于更新宠物昵称、品种或心情状态 (`status`)。

---

## 3. 体重记录 (Weights)

### 3.1 获取体重历史
- **URL**: `/weights`
- **Method**: `GET`
- **Query Params**: `petId={uuid}`

### 3.2 添加体重记录
- **URL**: `/weights`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "pet_id": "{uuid}",
    "weight": 4.5
  }
  ```

---

## 4. 今日任务 (Tasks)

### 4.1 获取宠物今日任务
- **URL**: `/tasks`
- **Method**: `GET`
- **Query Params**: `petId={uuid}`

### 4.2 更新任务状态 (完成/取消)
- **URL**: `/tasks/{id}`
- **Method**: `PATCH`
- **Request Body**:
  ```json
  {
    "completed": true
  }
  ```

---

## 5. 健康计划 (Health Plans)

### 5.1 获取当前激活计划
- **URL**: `/health-plans`
- **Method**: `GET`
- **Query Params**: `petId={uuid}`

### 5.2 AI 计划生成 (核心接口)
- **URL**: `/health-plans/generate`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "pet_id": "{uuid}",
    "goal_type": "lose/gain/maintain",
    "target_weight": 4.0
  }
  ```
- **工作流**: 
  1. 调用通义千问 API 生成内容。
  2. 持久化至 `health_plans` 表。
  3. **副作用**: 自动清理宠物当日旧任务，并根据新计划生成 4-7 个新任务（Feeding, Exercise, etc.）。

---

## 💡 前端集成提示
所有的请求封装在前端项目 [api.ts](file:///c:/Users/Bruce/Desktop/yourHealthPet/Pet/frontend/src/lib/api.ts) 中，开发者只需调用 `api.category.method()` 即可完成异步通信。
