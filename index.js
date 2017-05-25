
class Boleto {

    constructor () {
        this.code = document.getElementById('code');
        this.mask = document.getElementById('mask');

        this.maskFull =  'XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X';
        this.maskEmpty = '           -             -             -             - ';

        this.code.value = '';
        this.code.attributes['maxlength'] = this.maskFull.length;

        this.allowedKeys = new Set('0.1.2.3.4.5.6.7.8.9.Backspace.Delete.ArrowLeft.ArrowRight.Home.End'.split('.'));
        this.movementKeys = new Set('ArrowLeft.ArrowRight.Home.End'.split('.'));
        this.code.addEventListener('keydown', this.checkKey.bind(this));
    }

    checkKey(event) {
        if (!this.allowedKeys.has(event.key)) {
            event.preventDefault();
            return;
        }

        if (this.movementKeys.has(event.key)) {
            return;  // allow it, but stop here
        }

        const currentLength = this.code.value.length;
        const currentCaret = this.code.selectionStart;

        if ((event.key === 'Backspace' && currentCaret === 0) ||
            (event.key === 'Delete' && currentCaret === currentLength)) {
            event.preventDefault();
            return;  // no effect
        }

        const selectionSize = this.code.selectionEnd - this.code.selectionStart;
        const decreasingLength = event.key === 'Backspace' || event.key === 'Delete';

        const howMuchToDecrase = selectionSize > 0 ? selectionSize : 1;
        const howMuchToIncrease = selectionSize > 0 ? 1 - selectionSize : 1;
        const newLength = currentLength + (decreasingLength ? -howMuchToDecrase : howMuchToIncrease);

        if (newLength > this.maskFull.length) {
            event.preventDefault();
            return;
        }

        const currentMask = this.maskEmpty.substr(0, newLength) +
            this.maskFull.substr(newLength);
        this.mask.innerHTML = currentMask.replace(/\s/g, '&nbsp;');
    }
}

window.addEventListener('load', () => new Boleto());
