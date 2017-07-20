

class NumericComponent {

    constructor (codeElementId, maskElementId) {
        this.code = document.getElementById(codeElementId);
        this.mask = document.getElementById(maskElementId);

        this.maskFull =  'XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X';
        this.maskEmpty = '           -             -             -             - ';

        this.code.value = '';
        this.code.attributes['maxlength'] = this.maskFull.length;

        this.allowedKeys = new Set('0,1,2,3,4,5,6,7,8,9,Backspace,Delete,ArrowLeft,ArrowRight,Home,End'.split(','));
        this.movementKeys = new Set('ArrowLeft,ArrowRight,Home,End'.split(','));
        this.code.addEventListener('keydown', this.checkKey.bind(this));
    }

    checkKey(event) {
        // status before key is applied
        const currentLength = this.code.value.length;
        const currentCaret = this.code.selectionStart;

        // cancel event if either key is not allowed or field is full
        if (!this.allowedKeys.has(event.key)) {
            event.preventDefault();
            return;
        }

        // allow caret to move
        if (this.movementKeys.has(event.key)) {
            return;  // allow it, but stop here
        }

        // edge conditions
        if ((event.key === 'Backspace' && currentCaret === 0) ||
            (event.key === 'Delete' && currentCaret === currentLength)) {
            event.preventDefault();
            return;  // no effect
        }

        const selectionSize = this.code.selectionEnd - this.code.selectionStart;  // if any
        const isDecreasingLength = event.key === 'Backspace' || event.key === 'Delete';

        const howMuchToDecrease = selectionSize > 0 ? selectionSize : 1;
        const howMuchToIncrease = selectionSize > 0 ? 1 - selectionSize : 1;
        const newLength = currentLength + (isDecreasingLength ? -howMuchToDecrease : howMuchToIncrease);

        // check if new length is greater than allowed
        if (newLength > this.maskFull.length) {
            event.preventDefault();
            return;
        }

        // hide the part of the mask that is already filled
        const currentMask = this.maskEmpty.substr(0, newLength) + this.maskFull.substr(newLength);
        this.mask.innerHTML = currentMask.replace(/\s/g, '&nbsp;');
    }
}

class Boleto {

    constructor () {
        this.numericComponent = new NumericComponent('code', 'mask');
    }
}

window.addEventListener('load', () => new Boleto());
