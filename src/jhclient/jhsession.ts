import { getCurrentTimestamp } from "@/utils/data-utils";

/**
 * JHSession客户端配置选项
 */
export interface JHSessionOption {
  /** 客户端本地服务URL，默认为 http://127.0.0.1:60540/jhclientstarter */
  clientUrl?: string;
}

/**
 * 启动客户端所需的参数
 */
export interface StartClientParams {
  /** jhapp协议URL，用于启动本地客户端应用 */
  jhappUrl: string;
}

/**
 * 客户端错误代码枚举
 * 用于标识客户端启动过程中可能出现的各种错误类型
 *
 * @example
 * ```typescript
 * import { ClientErrorCode, ClientError } from './JHSessionClient';
 *
 * try {
 *   await client.startClient(url);
 * } catch (error) {
 *   if (error instanceof ClientError) {
 *     switch (error.code) {
 *       case ClientErrorCode.NOT_INSTALLED:
 *         alert('请先下载并安装客户端应用');
 *         break;
 *       case ClientErrorCode.DECRYPT_FAILED:
 *         console.error('参数解密失败，请检查加密参数是否正确');
 *         break;
 *       case ClientErrorCode.PARAMS_EXPIRED:
 *         console.error('启动参数已过期，请重新获取');
 *         break;
 *       case ClientErrorCode.TIMEOUT:
 *         console.error('请求超时，请检查客户端服务是否正常运行');
 *         break;
 *     }
 *   }
 * }
 * ```
 */
export enum ClientErrorCode {
  /**
   * 客户端未安装或服务未启动
   * 提示用户需要先安装JHAppClient客户端应用
   */
  NOT_INSTALLED = "-1",

  /**
   * 执行成功
   * 客户端启动成功
   */
  SUCCESS = "0",

  /**
   * 加密参数解密失败
   * jhappUrl中的加密部分无法正确解密，可能是密钥不匹配或参数格式错误
   */
  DECRYPT_FAILED = "1",

  /**
   * 参数过期
   * jhappUrl中的时间戳参数已过期，需要重新生成启动链接
   */
  PARAMS_EXPIRED = "4",

  /**
   * 加密部分为空
   * jhappUrl中缺少必需的加密参数
   */
  ENCRYPT_EMPTY = "7",
}

/**
 * 客户端错误类
 * 用于封装客户端启动过程中的错误信息
 */
export class ClientError extends Error {
  /** 错误代码 */
  public readonly code: string;
  /** 执行结果状态 */
  public readonly result: "failed" | "success";

  /**
   * 构造客户端错误对象
   * @param message - 错误描述信息
   * @param code - 错误代码
   * @param result - 执行结果状态
   */
  constructor(message: string, code: string, result: "failed" | "success") {
    super(message);
    this.name = "ClientError";
    this.code = code;
    this.result = result;
    Object.setPrototypeOf(this, ClientError.prototype);
  }
}

/**
 * JHSession客户端管理类
 * 负责与本地JHClient进行通信，实现客户端应用的启动和控制
 */
export class JHSessionClient {
  /** 客户端本地服务URL */
  private clientUrl = "http://127.0.0.1:60540/jhclientstarter";

  /** 客户端启动协议名称 */
  private static CLIENT_START_PROTOCOL = "jhclient";

  /** 隐藏iframe的ID名称 */
  private static IFRAME_ID_NAME = "jhinno-start-jhclient-hideen-frame";

  /**
   * 创建JHSession客户端实例
   * @param option - 可选配置项
   */
  constructor(option?: JHSessionOption) {
    if (option?.clientUrl) this.clientUrl = option?.clientUrl;
  }

  /**
   * 创建隐藏的iframe元素
   * 用于在页面中静默加载URL，实现协议启动
   * @returns 创建的iframe元素
   */
  private createHiddenIframe(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.src = "about:blank";
    iframe.id = JHSessionClient.IFRAME_ID_NAME;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    return iframe;
  }

  /**
   * 使用代理方式打开URI
   * 通过隐藏的iframe加载URL，触发协议启动
   * @param uri - 要打开的URI地址
   */
  private async openUriWithAgent(uri: string): Promise<void> {
    let iframe = document.getElementById(JHSessionClient.IFRAME_ID_NAME);
    if (!iframe) iframe = this.createHiddenIframe();
    (iframe as HTMLIFrameElement).src = uri;
  }

  /**
   * 通过客户端API发送请求
   * 使用postMessage机制与本地客户端进行通信
   * @param url - 请求URL
   * @param msgId - 消息ID，用于标识本次请求
   * @returns Promise，返回客户端响应数据
   */
  private sendRequestByClient(url: string, msgId: string) {
    console.info("调用jhclient本地api接口启动，url：", url);
    return new Promise<any>((reserve, reject) => {
      // 创建新的iframe发起请求
      const iframe = document.createElement("iframe");

      // 监听客户端返回的消息
      const handleMessage = (e: any) => {
        // 验证消息来源
        if (!this.clientUrl.startsWith(e.origin)) {
          reject();
          return;
        }
        console.info("result:" + JSON.stringify(e.data));

        // 根据返回码判断成功或失败
        if (e.data.code === "0") {
          reserve(e.data);
        } else {
          reject(e.data);
        }

        // 移除消息监听器
        window.removeEventListener("message", handleMessage);
      };

      window.addEventListener("message", handleMessage);

      // 移除已存在的同ID iframe
      const element = document.getElementById(msgId);
      if (element) {
        document.body.removeChild(element);
      }

      iframe.id = msgId;
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
    });
  }

  /**
   * 检查JHAppClient是否已安装并且服务已启动
   * @returns Promise<boolean> - true表示已安装且服务正常，false表示未安装或服务未启动
   */
  private async checkJHAppClientInstalled() {
    const msgId = `checkClientInstalled_${getCurrentTimestamp()}`;
    const url = `${this.clientUrl}?msgId=${msgId}`;
    return await this.sendRequestByClient(url, msgId)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * 启动JHClient客户端应用
   *
   * 根据不同的环境和协议类型，选择合适的启动方式：
   * 1. IE8、包含jhclient协议、Linux系统 - 使用协议启动
   * 2. jhappagent协议 - 使用代理方式启动
   * 3. 其他情况 - 使用本地API启动
   *
   * @param jhappUrl - jhapp协议URL，格式如：jhclient://[加密参数]
   * @throws {ClientError} 当客户端未安装或服务未启动时抛出异常
   *
   * @example
   * ```typescript
   * const client = new JHSessionClient();
   * try {
   *   await client.startClient('jhclient://xxxxx');
   *   console.log('客户端启动成功');
   * } catch (error) {
   *   if (error instanceof ClientError) {
   *     console.error(`启动失败: ${error.message}, code: ${error.code}`);
   *   }
   * }
   * ```
   *
   * **可能抛出的错误代码 (ClientErrorCode):**
   * - {@link ClientErrorCode.NOT_INSTALLED} (-1): jhappclient未安装或者服务未启动
   * - {@link ClientErrorCode.DECRYPT_FAILED} (1): 客户端加密参数解密失败
   * - {@link ClientErrorCode.PARAMS_EXPIRED} (4): 参数过期
   * - {@link ClientErrorCode.ENCRYPT_EMPTY} (7): jhappurl的加密部分为空
   * 
   * @see {@link ClientErrorCode} 完整错误代码定义
   * @see {@link ClientError} 错误对象类型
   */
  public async startClient(jhappUrl: string): Promise<void> {
    const userAgent = navigator.userAgent.toLowerCase();

    // 特定环境使用协议启动（IE8、Linux、已包含jhclient协议的UA）
    if (
      userAgent.indexOf("msie 8.0") > -1 ||
      userAgent.indexOf(JHSessionClient.CLIENT_START_PROTOCOL) > -1 ||
      userAgent.indexOf("linux") > -1 ||
      userAgent.indexOf("X11") > -1 ||
      navigator.platform.indexOf("linux") > -1
    ) {
      this.openUriWithAgent(jhappUrl);
      console.info("使用JHClient协议启动");
      return;
    }

    // 代理客户端 使用协议启动
    const isJhAppAgent = jhappUrl.startsWith("jhappagent");
    if (isJhAppAgent) {
      this.openUriWithAgent(jhappUrl);
      console.info("使用jhappagent启动");
      return;
    }

    // 正常情况下，使用API启动
    if (await this.checkJHAppClientInstalled()) {
      await this.connectionJHSession(jhappUrl);
      return;
    }

    // 客户端未安装或服务未启动
    throw new ClientError("jhclient未安装或者服务未启动", "-1", "failed");
  }

  /**
   * 连接JHSession会话
   * 解析jhapp协议URL并通过本地API启动客户端
   * @param jhappUrl - jhapp协议URL
   * @throws {ClientError} 启动失败时抛出异常
   */
  private async connectionJHSession(jhappUrl: string): Promise<void> {
    // 移除协议头 "jhclient://" 和结尾的 "/"
    const param = jhappUrl.replace(/^jhclient:\/\//, "").replace(/\/$/, "");
    const msgId = `jhapp_${getCurrentTimestamp()}`;
    const url = `${this.clientUrl}?startclient=${param}&msgId=${msgId}`;
    await this.sendRequestByClient(url, msgId);
  }
}
