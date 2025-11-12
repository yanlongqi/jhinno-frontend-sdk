/**
 * 下载安装包
 * @param downloadUrl 安装包的下载地址
 */
export function downloadPkg(downloadUrl: string) {
  console.log("下载安装包，downloadUrl：", downloadUrl);
  const form = document.createElement("form") as HTMLFormElement;
  form.method = "post";
  form.action = downloadUrl;
  form.hidden = true;
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
