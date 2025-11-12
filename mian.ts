import { JHSessionClient } from "./src";

window.onload = () => {
  const testForm = document.querySelectorAll("#testForm")[0];

  const clent = new JHSessionClient();

  (testForm as HTMLFormElement).onsubmit = async (e) => {
    e.preventDefault(); // 阻止表单默认提交行为，避免页面跳转

    const jhappurlInput = document.getElementById(
      "jhappurl"
    ) as HTMLInputElement;

    try {
      const clent = new JHSessionClient();
      await clent.startClient(jhappurlInput.value);
    } catch (e: any) {
      alert(e.message);
    }
  };
};
