const fallbackCopyTextToClipboard = function (text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

export const copyTextToClipboard = function (text: string): Promise<boolean> {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return new Promise(() => {return true});
    }
    const result = navigator.clipboard.writeText(text).then(
        () => {
            return true;
        },
        (err: any) => {
            console.error('Async: Could not copy text: ', err);
            return false;
        }
    );

    return result;
}
