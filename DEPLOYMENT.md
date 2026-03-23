# Pet Health 项目部署与环境说明文档

## 1. 运行环境依赖

要完整运行本项目的前后端，你的机器需要安装并配置以下环境：

### 1.1 前端环境
- **Node.js**: 建议 v16 或更高版本
- **包管理器**: npm (Node 附带)

### 1.2 后端环境
- **Java**: JDK 17 (已在系统环境变量中配置 `JAVA_HOME` 和 `Path`)
- **Maven**: 3.9+ (已在系统环境变量中配置 `MAVEN_HOME` 和 `Path`)
- **MySQL**: 8.4 版本
  - 本项目默认数据库配置：
    - URL: `jdbc:mysql://localhost:3306/pet_health`
    - Username: `root`
    - Password: `admin`

---

## 2. 数据库说明与启动方式

为了不影响你电脑中原有的 MySQL 默认配置，本项目采用**独立数据目录挂载**的方式启动 MySQL。

### 2.1 启动 MySQL (当前机器特供)
由于数据库的数据存放在项目根目录的 `mysql-data` 中，你可以通过以下命令（在 PowerShell 中）隐式启动数据库服务：
```powershell
Start-Process -FilePath "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" -ArgumentList "--basedir=`"C:\Program Files\MySQL\MySQL Server 8.4`" --datadir=`"$PWD\mysql-data`"" -WindowStyle Hidden
```
*(注意：请确保你处于 `Pet` 项目根目录下执行此命令)*

### 2.2 数据库建表语句
后端 Spring Boot 集成了 JPA，默认会在连接上数据库后自动建表（`spring.jpa.hibernate.ddl-auto=update`）。
为了方便你日后迁移或手动查阅，我已经将当前数据库的完整表结构导出到了项目根目录下的 [database_schema.sql](./database_schema.sql) 文件中。

---

## 3. 项目启动指南

### 3.1 启动后端 (Spring Boot)
1. 打开终端，进入 `backend` 目录：
   ```bash
   cd backend
   ```
2. 使用 Maven 启动服务：
   ```bash
   mvn spring-boot:run
   ```
   *(或者运行打包好的 jar：`java -jar target/backend-1.0-SNAPSHOT.jar`)*
3. 服务将运行在：`http://localhost:8080`

### 3.2 启动前端 (Vite + React)
1. 打开一个新的终端，进入 `frontend` 目录：
   ```bash
   cd frontend
   ```
2. 安装依赖（首次运行）：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 浏览器访问：`http://localhost:5173` (如果端口被占用，Vite 会自动分配如 5174，请注意控制台输出)

---

## 4. 测试账号说明

前端默认连接到 `http://localhost:8080/api`。在数据库成功启动的前提下，你可以使用以下预设账号登录体验：

- **账号 / 邮箱**: `demo@pet.health`
- **密码**: `demo`

该账号下已预置了测试宠物（Wangcai）、测试体重记录以及测试任务。
