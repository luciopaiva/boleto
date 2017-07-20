"use strict";


class NumericCode {

    constructor (elementId) {
        this.numericCodeElement = document.getElementById(elementId);
        document.addEventListener('keydown', this.onKeyDown.bind(this));

        this.allowedKeys = new Set('0,1,2,3,4,5,6,7,8,9,Backspace'.split(','));
        this.setCode('');
    }

    /**
     * @private
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        if (this.allowedKeys.has(event.key)) {
            this.processCodeKey(event.key);
        }
    }

    /**
     * @private
     * @return {string}
     */
    getCodeWithMask() {
        let result = '';
        let maskIndex = 0;
        for (let codeDigit of this.code) {
            result += codeDigit;
            maskIndex++;
            while (maskIndex < NumericCode.CODE_MASK.length) {
                if (NumericCode.CODE_MASK[maskIndex] === 'X') {
                    break;
                }
                result += NumericCode.CODE_MASK[maskIndex];
                maskIndex++;
            }
        }
        return result;
    }

    /**
     * @private
     * @param {string} key
     */
    processCodeKey(key) {
        if (key === 'Backspace') {
            if (this.code.length > 0) {
                this.code = this.code.substr(0, this.code.length - 1);
            }
            // otherwise discard Backspace
        } else if (this.code.length < NumericCode.CODE_SIZE_IN_DIGITS) {
            this.code += key;
        }

        this.setCode(this.code);
    }

    /**
     * @param {string} code - numeric code without mask
     */
    setCode(code) {
        this.code = code;
        this.numericCodeElement.innerText = this.getCodeWithMask();
    }
}

NumericCode.CODE_SIZE_IN_DIGITS = 48;
NumericCode.CODE_MASK = 'XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X';

class Boleto {

    constructor () {
        this.numericCode = new NumericCode('numeric-code');
        this.numericCode.setCode('846700000009699001090116033141666515101001037833');
    }
}

new Boleto();
