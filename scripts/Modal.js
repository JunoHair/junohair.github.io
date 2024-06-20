let alertDialog, alertDialogMessage, confirmDialog, confirmDialogMessage, promptDialog, promptDialogMessage, promptInput, promptConfirm;

window.addEventListener('load', () => {
    document.body.insertAdjacentHTML('afterbegin', `<dialog id="alert-dialog">
            <p id="message-alert">
                확인창입니다.
            </p>
            <form method="dialog">
                <div id="modal-confirm-btn">
                    <button autofocus>확인</button>
                </div>
            </form>
        </dialog>
        <dialog id="confirm-dialog">
            <p id="message-confirm">
                확인창입니다.
            </p>
            <form method="dialog">
                <div id="modal-confirm-btn">
                    <button autofocus value="confirm">확인</button>
                    <button value="cancel">취소</button>
                </div>
            </form>
        </dialog>
        <dialog id="prompt-dialog">
            <p id="message-prompt">
                확인창입니다.
            </p>
            <form method="dialog">
                <input autofocus type="text" id="prompt-input" value="">
                <div id="modal-confirm-btn">
                    <button id="prompt-confirm" value="">확인</button>
                    <button value="">취소</button>
                </div>
            </form>
        </dialog>`);

    alertDialog = document.getElementById('alert-dialog');
    alertDialogMessage = document.getElementById('message-alert');
    confirmDialog = document.getElementById('confirm-dialog');
    confirmDialogMessage = document.getElementById('message-confirm');
    promptDialog = document.getElementById('prompt-dialog');
    promptDialogMessage = document.getElementById('message-prompt');
    promptInput = document.getElementById('prompt-input');
    promptConfirm = document.getElementById('prompt-confirm');
});

/**
 * 커스텀 alert
 * @param {string} msg 띄울 메시지
 */
function alertModal(msg) {
    alertDialogMessage.textContent = msg;
    alertDialog
    alertDialog.showModal();
}

/**
 * 커스텀 confirm
 * @param {string} msg 띄울 메시지
 * @param {{ (accepted: boolean): void }} after 확인 버튼을 눌렀을 때 실행될 리스너
 */
function confirmModal(msg, after) {
    confirmDialogMessage.textContent = msg;
    confirmDialog.addEventListener('close', (e) => {
        after(e.target.returnValue == 'confirm');
    }, { once: true });
    confirmDialog.showModal();
}

/**
 * 커스텀 prompt
 * @param {string} msg 띄울 메시지
 * @param {string} msgdef 입력값의 기본값
 * @param {{ (msg: string): void }} after 확인 버튼을 눌렀을 때 실행될 리스너
 */
function promptModal(msg, msgdef, after) {
    promptDialogMessage.textContent = msg;
    promptInput.value = msgdef;
    promptConfirm.value = promptInput.value;
    promptInput.addEventListener('change', () => {
        promptConfirm.value = promptInput.value;
    });
    promptDialog.addEventListener('close', (e) => {
        after(e.target.returnValue);
    }, { once: true });
    promptDialog.showModal();
}