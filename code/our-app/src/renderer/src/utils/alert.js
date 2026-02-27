import Swal from "sweetalert2";

const smallPopupStyle = {
  popup: "swal-dark-popup swal-small-popup swal-tiny-popup",
};

let _locale = { success: 'Thành công', error: 'Lỗi', cancel: 'Hủy' };
export function setAlertLocale(locale) {
  _locale = { ..._locale, ...locale };
}

function getThemeColors() {
  const isLight = document.documentElement.classList.contains('light');
  return {
    background: isLight ? '#ffffff' : '#282828',
    color: isLight ? '#1a1a1a' : '#ffffff',
  };
}

const importSuccessIcon =
  '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#1db954"/><path d="M10 17.5L14 21L22 13" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const importFailIcon =
  '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#d33"/><path d="M11 21L21 11M11 11l10 10" stroke="white" stroke-width="2.2" stroke-linecap="round"/></svg>';
  export function mapFirebaseError(err) {
  const code = err?.code || "";
  const msg = err?.message || "Đã xảy ra lỗi.";

  switch (code) {
    case "auth/wrong-password":
      return "Mật khẩu hiện tại không đúng.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu (tối thiểu 6 ký tự).";
    case "auth/invalid-email":
      return "Email không hợp lệ.";
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng.";
    case "auth/user-not-found":
      return "Tài khoản không tồn tại.";
    case "auth/too-many-requests":
      return "Thao tác quá nhiều lần. Vui lòng thử lại sau.";
    case "auth/requires-recent-login":
      return "Vì lý do bảo mật, vui lòng đăng nhập lại rồi thử lại.";
    case "auth/missing-current-password":
        return "Vui lòng nhập mật khẩu hiện tại.";
    case "permission-denied":
      return "Bạn không có quyền thực hiện thao tác này.";
    case "unavailable":
      return "Không thể kết nối tới máy chủ. Hãy thử lại.";
    default:
      return msg;
  }
}

export async function showAlert(titleOrMessage, maybeMessage, details) {
  const hasTitle = typeof maybeMessage === "string";
  const title = hasTitle ? titleOrMessage : "";
  const message = hasTitle ? maybeMessage : titleOrMessage;

  const html = `
    <div style="text-align:center; line-height:1.35;">
      <div style="font-weight:600; margin-bottom:6px;">${title || ""}</div>
      <div>${message || ""}</div>
      ${
        details
          ? `<div style="margin-top:6px; opacity:.8; font-size:12px;">${details}</div>`
          : ""
      }
    </div>
  `;

  await Swal.fire({
  title: "",
  html,
  icon: "info",                 
  confirmButtonText: "OK",
  confirmButtonColor: "#1db954",
  ...getThemeColors(),
  customClass: smallPopupStyle,
  width: 260,
  padding: "0.8em",
  iconColor: "#1db954",
});
}
const errorIcon =
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#e84545"/>
    <path d="M11 11L21 21M21 11L11 21"
      stroke="white"
      stroke-width="2.4"
      stroke-linecap="round"/>
  </svg>`;

export async function showError(message, details) {
  await Swal.fire({
    title: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="margin-bottom:6px;">${errorIcon}</div>
        <div style="font-weight:600;">${_locale.error}</div>
        <div style="margin-top:2px;">${message}</div>
        ${
          details
            ? `<div style="margin-top:6px;font-size:12px;opacity:.75">${details}</div>`
            : ""
        }
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: "OK",
    confirmButtonColor: "#1db954",
    ...getThemeColors(),
    customClass: smallPopupStyle,
    width: 260,
    padding: "0.8em",
  });
}

export async function showSuccess(message, details) {
  await Swal.fire({
    title: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="margin-bottom:6px;">${importSuccessIcon}</div>
        <div style="font-weight:600;">${_locale.success}</div>
        <div style="margin-top:2px;">${message}</div>
        ${
          details
            ? `<div style="margin-top:6px;font-size:12px;opacity:.75">${details}</div>`
            : ""
        }
      </div>
    `,
    showConfirmButton: false,
    ...getThemeColors(),
    customClass: smallPopupStyle,
    width: 260,
    padding: "0.8em",
    timer: 3000,
  });
}    

export async function showConfirm(message) {
  const result = await Swal.fire({
    title: "",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: _locale.cancel,
    confirmButtonColor: "#1db954",
    cancelButtonColor: "#d33",
    ...getThemeColors(),
    customClass: smallPopupStyle,
    width: 240,
    padding: "0.8em",
    iconColor: "#1db954",
  });
  return result.isConfirmed;
}

export async function showImportSuccess(message) {
  await Swal.fire({
    title: "",
    html: `<div style='display:flex;flex-direction:column;align-items:center;'><div style='margin-bottom:0.5em;'>${importSuccessIcon}</div><div>${message}</div></div>`,
    showConfirmButton: false,
    ...getThemeColors(),
    customClass: smallPopupStyle,
    width: 240,
    padding: "0.8em",
    timer: 1400,
  });
}

export async function showImportFail(message) {
  await Swal.fire({
    title: "",
    html: `<div style='display:flex;flex-direction:column;align-items:center;'><div style='margin-bottom:0.5em;'>${importFailIcon}</div><div>${message}</div></div>`,
    showConfirmButton: false,
    ...getThemeColors(),
    customClass: smallPopupStyle,
    width: 240,
    padding: "0.8em",
    timer: 1800,
  });
}

if (!document.getElementById("swal-tiny-style")) {
  document.head.insertAdjacentHTML(
    "beforeend",
    `
<style id="swal-tiny-style">
.swal-small-popup, .swal-tiny-popup { font-size: 13px !important; border-radius: 8px !important; }
.swal2-popup.swal-small-popup.swal-tiny-popup { min-width: 160px !important; max-width: 90vw !important; }
.swal2-title { font-size: 15px !important; margin-bottom: 0.4em !important; }
.swal2-html-container, .swal2-content { font-size: 13px !important; }
.swal2-actions button { font-size: 12px !important; padding: 5px 14px !important; border-radius: 4px !important; }
.swal2-icon { width: 32px !important; height: 32px !important; min-width: 32px !important; min-height: 32px !important; margin: 0 auto 0.5em auto !important; }
.swal2-icon .swal2-icon-content { font-size: 22px !important; }
</style>
`
  );
}
