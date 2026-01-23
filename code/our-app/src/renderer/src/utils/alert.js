import Swal from 'sweetalert2';

const smallPopupStyle = {
    popup: 'swal-dark-popup swal-small-popup swal-tiny-popup'
};
const importSuccessIcon =
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#1db954"/><path d="M10 17.5L14 21L22 13" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const importFailIcon =
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#d33"/><path d="M11 21L21 11M11 11l10 10" stroke="white" stroke-width="2.2" stroke-linecap="round"/></svg>';

export async function showAlert(message) {
    await Swal.fire({
        title: '',
        text: message,
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1db954',
        background: '#282828',
        color: '#fff',
        customClass: smallPopupStyle,
        width: 240,
        padding: '0.8em',
        iconColor: '#1db954',
    });
}

export async function showConfirm(message) {
    const result = await Swal.fire({
        title: '',
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#1db954',
        cancelButtonColor: '#d33',
        background: '#282828',
        color: '#fff',
        customClass: smallPopupStyle,
        width: 240,
        padding: '0.8em',
        iconColor: '#1db954',
    });
    return result.isConfirmed;
}

export async function showImportSuccess(message) {
    await Swal.fire({
        title: '',
        html: `<div style='display:flex;flex-direction:column;align-items:center;'><div style='margin-bottom:0.5em;'>${importSuccessIcon}</div><div>${message}</div></div>`,
        showConfirmButton: false,
        background: '#282828',
        color: '#fff',
        customClass: smallPopupStyle,
        width: 240,
        padding: '0.8em',
        timer: 1400,
    });
}

export async function showImportFail(message) {
    await Swal.fire({
        title: '',
        html: `<div style='display:flex;flex-direction:column;align-items:center;'><div style='margin-bottom:0.5em;'>${importFailIcon}</div><div>${message}</div></div>`,
        showConfirmButton: false,
        background: '#282828',
        color: '#fff',
        customClass: smallPopupStyle,
        width: 240,
        padding: '0.8em',
        timer: 1800,
    });
}

if (!document.getElementById('swal-tiny-style')) {
    document.head.insertAdjacentHTML('beforeend', `
<style id="swal-tiny-style">
.swal-small-popup, .swal-tiny-popup {
  font-size: 13px !important;
  border-radius: 8px !important;
}
.swal2-popup.swal-small-popup.swal-tiny-popup {
  min-width: 160px !important;
  max-width: 90vw !important;
}
.swal2-title {
  font-size: 15px !important;
  margin-bottom: 0.4em !important;
}
.swal2-html-container, .swal2-content {
  font-size: 13px !important;
}
.swal2-actions button {
  font-size: 12px !important;
  padding: 5px 14px !important;
  border-radius: 4px !important;
}
.swal2-icon {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  margin: 0 auto 0.5em auto !important;
}
.swal2-icon .swal2-icon-content {
  font-size: 22px !important;
}
</style>
`);
}
