/**
 * 获取格式化的时间戳字符串
 *
 * 格式：yyyyMMddhhmmss
 *
 * @param offsetSeconds - 可选参数，时间偏移量（秒）。正数表示未来时间，负数表示过去时间
 * @returns 格式化的时间戳字符串
 *
 * @example
 * // 获取当前时间
 * getCurrentTimestamp();
 * // 输出：'20251112104456' (假设当前时间是 2025-11-12 10:44:56)
 *
 * @example
 * // 获取30秒后的时间
 * getCurrentTimestamp(30);
 * // 输出：'20251112104526' (当前时间 + 30秒)
 */
export function getCurrentTimestamp(offsetSeconds?: number) {
  const format = "yyyyMMddhhmmss";

  const now = new Date();

  if (offsetSeconds) {
    now.setSeconds(now.getSeconds() + offsetSeconds);
  }

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  const formattedDate = format
    .replace(/yyyy/g, year.toString())
    .replace(/MM/g, String(month).padStart(2, "0"))
    .replace(/dd/g, String(day).padStart(2, "0"))
    .replace(/hh/g, String(hour).padStart(2, "0"))
    .replace(/mm/g, String(minute).padStart(2, "0"))
    .replace(/ss/g, String(second).padStart(2, "0"));

  return formattedDate;
}
