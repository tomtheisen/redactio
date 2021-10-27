export function selectAllAndCopy(el: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(el);
    let selection = getSelection();
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy")
    }    
}
