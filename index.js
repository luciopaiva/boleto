"use strict";


class NumericCode {

    constructor (elementId) {
        this.isCodeValid = false;
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
        this.validateCode();
        this.numericCodeElement.innerText = this.getCodeWithMask();
    }

    validateCode() {
        // ToDo validate code
        this.isCodeValid = true;
        return this.isCodeValid;
    }

    analyze() {
        if (!this.isCodeValid) {
            return null;
        }

        // get rid of validation digits
        const strippedCode =
            this.code.substr(0, 11) +
            this.code.substr(12, 11) +
            this.code.substr(24, 11) +
            this.code.substr(36, 11);

        const product = strippedCode[0];  // should be always "8"
        const segment = strippedCode[1];
        const valueType = strippedCode[2];
        const errorCheckDigit = strippedCode[3];
        const value = strippedCode.substring(4, 15);

        const companyId = strippedCode.substring(15, 19);
        const freeField = strippedCode.substring(19, 44);

        // const cnpj = this.code.substring(15, 23);
        // const freeField = this.code.substring(23, 44);

        return { product, segment, valueType, errorCheckDigit, value, companyId, freeField };
    }
}

NumericCode.CODE_SIZE_IN_DIGITS = 48;
NumericCode.CODE_MASK = 'XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X';

class Boleto {

    constructor () {
        this.numericCode = new NumericCode('numeric-code');

        this.sampleButton = document.getElementById('button-sample');
        this.sampleButton.addEventListener('click', () => this.loadSample());
    }

    pause() {
        return new Promise(resolve => setTimeout(resolve, 5));
    }

    async loadSample() {
        const sample = '846700000009699001090116033141666515101001037833';
        for (let i = 1; i < sample.length; i++) {
            this.numericCode.setCode(sample.slice(0, i));
            await this.pause();
        }
        this.numericCode.setCode(sample);
        const obj = this.numericCode.analyze();
        console.info(obj.product);
        console.info(obj.segment);
        console.info(obj.valueType);
        console.info(obj.errorCheckDigit);
        console.info(obj.value);
        console.info(obj.companyId);
        console.info(obj.freeField);
    }
}

new Boleto();
