export default function addClass(el, newClass) {
    if (el.className.indexOf(newClass) !== -1) {
        return;
    }
    if (el.className !== '') {
        newClass = ' ' + newClass;
    }

    el.className += newClass;
}