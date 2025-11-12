# @jhinno/frontend-sdk

景行前端集成 SDK，用于在前端应用中启动和管理 JHClient 客户端应用。

## 特性

- 📦 TypeScript 支持
- 🌐 跨平台兼容（Windows、Linux）
- 🎯 简单易用的 API

## 安装

```bash
npm install @jhinno/frontend-sdk
```

或使用 yarn：

```bash
yarn add @jhinno/frontend-sdk
```

或使用 pnpm：

```bash
pnpm add @jhinno/frontend-sdk
```

## 快速开始

### 基础使用

#### ES Module 方式（推荐）

```javascript
import { JHSessionClient } from "@jhinno/frontend-sdk";

// 创建客户端实例
const client = new JHSessionClient();

// 启动客户端
try {
  await client.startClient("jhclient://xxxxx");
} catch (error) {
  if (error instanceof ClientError) {
    switch (error.code) {
      case ClientErrorCode.NOT_INSTALLED:
        alert("请先下载并安装客户端应用");
        break;
      case ClientErrorCode.DECRYPT_FAILED:
        console.error("参数解密失败，请检查加密参数是否正确");
        break;
      case ClientErrorCode.PARAMS_EXPIRED:
        console.error("启动参数已过期，请重新获取");
        break;
      case ClientErrorCode.ENCRYPT_EMPTY:
        console.error("缺少必需的加密参数");
        break;
      default:
        console.error("未知错误:", error.message);
    }
  }
}
```

#### UMD 方式（浏览器直接引入）

```html
<!DOCTYPE html>
<html>
  <head>
    <title>景行 SDK 示例</title>
  </head>
  <body>
    <button onclick="startJHClient()">启动客户端</button>

    <!-- 通过 CDN 引入 -->
    <script src="https://unpkg.com/@jhinno/frontend-sdk@latest/dist/jhinno-frontend-sdk.umd.js"></script>

    <script>
      // SDK 会挂载到全局变量 JhinnoFrontendSdk 上
      const { JHSessionClient } = JhinnoFrontendSdk;

      async function startJHClient() {
        const client = new JHSessionClient();

        try {
          await client.startClient("jhclient://your-encrypted-params/");
          console.log("客户端启动成功");
          alert("客户端启动成功");
        } catch (error) {
          console.error("客户端启动失败:", error);
          if (error instanceof ClientError) {
            alert(`启动失败: ${error.message}`);
          }
        }
      }
    </script>
  </body>
</html>
```

你也可以下载文件到本地引入：

```html
<!-- 本地引入 -->
<script src="path/to/index.umd.js"></script>

<script>
  const { JHSessionClient } = JhinnoFrontendSdk;
  // 使用方式同上
</script>
```

### 自定义配置（一般不会用到）

```typescript
import { JHSessionClient, JHSessionOption } from "@jhinno/frontend-sdk";

// 自定义客户端服务 URL
const options: JHSessionOption = {
  clientUrl: "http://127.0.0.1:60540/jhclientstarter",
};

const client = new JHSessionClient(options);
```

## API 方法列表

### 核心类

| 类名/方法               | 说明           | 参数               | 返回值            |
| ----------------------- | -------------- | ------------------ | ----------------- |
| **JHSessionClient**     | 客户端管理类   |                    |                   |
| `constructor(option?)`  | 创建客户端实例 | `JHSessionOption?` | `JHSessionClient` |
| `startClient(jhappUrl)` | 启动客户端应用 | `string`           | `Promise<void>`   |

### 工具函数

| 函数名                                | 说明               | 参数      | 返回值   |
| ------------------------------------- | ------------------ | --------- | -------- |
| `getCurrentTimestamp(offsetSeconds?)` | 获取格式化的时间戳 | `number?` | `string` |
| `downloadPkg(downloadUrl)`            | 下载安装包         | `string`  | `void`   |

### 类型定义

| 类型名                | 说明               |
| --------------------- | ------------------ |
| **JHSessionOption**   | 客户端配置选项     |
| **StartClientParams** | 启动客户端所需参数 |
| **ClientError**       | 客户端错误类       |
| **ClientErrorCode**   | 客户端错误代码枚举 |

### 导入示例

```typescript
import {
  // 核心类
  JHSessionClient,

  // 工具函数
  getCurrentTimestamp,
  downloadPkg,

  // 类型定义
  JHSessionOption,
  StartClientParams,
  ClientError,
  ClientErrorCode,
} from "@jhinno/frontend-sdk";
```

## API 详细文档

### JHSessionClient

客户端管理类，负责与本地 JHClient 进行通信。

#### 构造函数

```typescript
constructor(option?: JHSessionOption)
```

**参数：**

- `option` (可选): 客户端配置选项
  - `clientUrl` (可选): 客户端本地服务 URL，默认为 `http://127.0.0.1:60540/jhclientstarter`

#### 方法

##### startClient

启动 JHClient 客户端应用。

```typescript
async startClient(jhappUrl: string): Promise<void>
```

**参数：**

- `jhappUrl`: jhapp 协议 URL，掉用景行启动应用的接口获得，格式如 `jhclient://[加密参数]/`

**抛出异常：**

- `ClientError`: 当客户端未安装或启动失败时

**示例：**

```typescript
const client = new JHSessionClient();

try {
  await client.startClient("jhclient://xxxxx");
  console.log("客户端启动成功");
} catch (error) {
  if (error instanceof ClientError) {
    console.error(`启动失败: ${error.message}`);
    console.error(`错误代码: ${error.code}`);
    console.error(`执行结果: ${error.result}`);
  }
}
```

### 错误处理

#### ClientError

客户端错误类，用于封装客户端启动过程中的错误信息。

**属性：**

- `code`: 错误代码
- `result`: 执行结果状态 (`"failed"` | `"success"`)
- `message`: 错误描述信息

#### ClientErrorCode

客户端错误代码枚举。

| 错误代码         | 值   | 说明                     |
| ---------------- | ---- | ------------------------ |
| `NOT_INSTALLED`  | "-1" | 客户端未安装或服务未启动 |
| `SUCCESS`        | "0"  | 执行成功                 |
| `DECRYPT_FAILED` | "1"  | 加密参数解密失败         |
| `PARAMS_EXPIRED` | "4"  | 参数过期                 |
| `ENCRYPT_EMPTY`  | "7"  | 加密部分为空             |

**完整示例：**

```typescript
import {
  JHSessionClient,
  ClientError,
  ClientErrorCode,
} from "@jhinno/frontend-sdk";

const client = new JHSessionClient();

try {
  await client.startClient("jhclient://xxxxx");
} catch (error) {
  if (error instanceof ClientError) {
    switch (error.code) {
      case ClientErrorCode.NOT_INSTALLED:
        alert("请先下载并安装客户端应用");
        break;
      case ClientErrorCode.DECRYPT_FAILED:
        console.error("参数解密失败，请检查加密参数是否正确");
        break;
      case ClientErrorCode.PARAMS_EXPIRED:
        console.error("启动参数已过期，请重新获取");
        break;
      case ClientErrorCode.ENCRYPT_EMPTY:
        console.error("缺少必需的加密参数");
        break;
      default:
        console.error("未知错误:", error.message);
    }
  }
}
```

## 工具函数

### getCurrentTimestamp

获取格式化的时间戳字符串。

> 传递到后端，后端掉用启动应用的接口的时候会用到,`offsetSeconds`时间的偏移量，正数整数。表示获得的 `jhappurl` 的有效时间。
> 后端掉用启动会话的接口的时候如果不传，景行服务器与用户的客户端的时间如果不同步的话会导致无法启动，提示`jhappurl` 过期.

```typescript
function getCurrentTimestamp(offsetSeconds?: number): string;
```

**参数：**

- `offsetSeconds` (可选): 时间偏移量（秒）。表示获得的 `jhappurl` 的有效时间。

**返回值：**

- 格式化的时间戳字符串，格式为 `yyyyMMddhhmmss`

**示例：**

```typescript
import { getCurrentTimestamp } from "@jhinno/frontend-sdk";

// 获取当前时间
const now = getCurrentTimestamp();
console.log(now); // '20251112104456'

// 获取30秒后的时间
const future = getCurrentTimestamp(30);
console.log(future); // '20251112104526'
```

### downloadPkg

下载客户端安装包。

```typescript
function downloadPkg(downloadUrl: string): void;
```

**参数：**

- `downloadUrl`: 安装包的下载地址

**功能说明：**

该函数通过创建隐藏的 form 表单并自动提交来触发文件下载。适用于需要下载 JHClient 客户端安装包的场景。

**示例：**

```typescript
import { downloadPkg, ClientError, ClientErrorCode, JHSessionClient } from "@jhinno/frontend-sdk";

const client = new JHSessionClient();

try {
  await client.startClient("jhclient://xxxxx");
} catch (error) {
  if (error instanceof ClientError && error.code === ClientErrorCode.NOT_INSTALLED) {
    // 客户端未安装，引导用户下载
    alert("检测到客户端未安装，即将开始下载...");
    downloadPkg("https://example.com/download/jhclient-setup.exe");
  }
}
```

## 启动方式

SDK 会根据不同的环境和协议类型自动选择合适的启动方式：

1. **协议启动**：适用于 IE8、Linux 系统或包含 jhclient 协议的环境
2. **代理启动**：适用于 jhappagent 协议
3. **API 启动**：适用于其他情况，通过本地 API 与客户端通信

## 兼容性

- 支持现代浏览器（Chrome、Firefox、Edge 等）
- 支持 Windows 和 Linux 平台

## 开发

### 环境要求

- pnpm / npm / yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

## 技术栈

- TypeScript 5.9+
- Vite 7.2+
- vite-plugin-dts (生成类型声明)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 支持

电话（同微信）：18794888087
邮箱：lqyan@jhinno.com

## 更多信息

- 仓库地址：https://github.com/yanlongqi/jhinno-frontend-sdk
- 关键词：sdk, frontend, jhinno, 景行锐创
