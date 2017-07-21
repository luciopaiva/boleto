"use strict";


class NumericCodeComponent {

    constructor (inputElementId, clearButtonElementId) {
        this.numericCodeElement = document.getElementById(inputElementId);
        this.clearButtonElement = document.getElementById(clearButtonElementId);

        this.isCodeComplete = false;
        document.addEventListener('keydown', this.onKeyDown.bind(this));

        this.clearButtonElement.addEventListener('click', () => this.setCode(''));

        this.allowedKeys = new Set('0,1,2,3,4,5,6,7,8,9,Backspace'.split(','));
        this.setCode('');
    }

    setCodeChangeCallback(onCodeChangedCallback) {
        this.onCodeChangedCallback = onCodeChangedCallback;
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
            while (maskIndex < NumericCodeComponent.CODE_MASK.length) {
                if (NumericCodeComponent.CODE_MASK[maskIndex] === 'X') {
                    break;
                }
                result += NumericCodeComponent.CODE_MASK[maskIndex];
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
            } else {
                // otherwise discard Backspace
                return;
            }
        } else if (this.code.length < NumericCodeComponent.CODE_SIZE_IN_DIGITS) {
            this.code += key;
        }

        this.setCode(this.code);
    }

    /**
     * @param {string} code - numeric code without mask
     */
    setCode(code) {
        this.code = code;
        this.isComplete();
        this.numericCodeElement.innerText = this.getCodeWithMask();
        if (this.onCodeChangedCallback) this.onCodeChangedCallback();
    }

    getCode() {
        return this.code;
    }

    isComplete() {
        this.isCodeComplete = this.code.length === NumericCodeComponent.CODE_SIZE_IN_DIGITS;
        return this.isCodeComplete;
    }
}

NumericCodeComponent.CODE_SIZE_IN_DIGITS = 48;
NumericCodeComponent.CODE_MASK = 'XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X XXXXXXXXXXX-X';

class CodeInformation {

    /**
     * @param {string} code
     * @return {boolean}
     */
    static validate(code) {
        if (!code || code.length !== NumericCodeComponent.CODE_SIZE_IN_DIGITS) {
            return false;
        }

        if (code[0] !== '8') {
            return false;
        }

        const isModulus10 = code[2] === '6' || code[2] === '7';  // 8 and 9 are modulus 11
        return isModulus10 ? CodeInformation.validateModulus10(code) : CodeInformation.validateModulus11(code);
    }

    static validateModulus10(code) {
        const parts = CodeInformation.breakCodeParts(code);
        const validationDigits = [code[11], code[23], code[35], code[47]];

        CodeInformation.validateModulus10Part(parts[0], validationDigits[0]);
        CodeInformation.validateModulus10Part(parts[1], validationDigits[1]);
        CodeInformation.validateModulus10Part(parts[2], validationDigits[2]);
        CodeInformation.validateModulus10Part(parts[3], validationDigits[3]);

        return CodeInformation.validateModulus10Part(parts[0], validationDigits[0]) &&
            CodeInformation.validateModulus10Part(parts[1], validationDigits[1]) &&
            CodeInformation.validateModulus10Part(parts[2], validationDigits[2]) &&
            CodeInformation.validateModulus10Part(parts[3], validationDigits[3]);
    }

    static validateModulus10Part(codePart, validationDigit) {
        let resultingDigits = '';
        for (let i = 0; i < codePart.length; i++) {
            const multiplier = i % 2 === 0 ? 2 : 1;
            resultingDigits += (parseInt(codePart[i], 10) * multiplier).toString();
        }
        const sum = resultingDigits.split('').map(d => parseInt(d, 10)).reduce((acc, val) => acc + val, 0);
        const mod10 = sum % 10;
        const result = mod10 === 0 ? 0 : 10 - mod10;

        console.info(result.toString(), validationDigit.toString());
        return result.toString() === validationDigit.toString();
    }

    static validateModulus11(code) {

    }

    /**
     * Breaks code into 4 11-digit parts and gets rid of validation digits.
     * @param code
     * @return {[string, string, string, string]}
     */
    static breakCodeParts(code) {
        return [code.substr(0, 11),
            code.substr(12, 11),
            code.substr(24, 11),
            code.substr(36, 11)];
    }

    /**
     * @param {string} code
     */
    static parseCode(code) {
        // invalid code yields null
        if (!CodeInformation.validate(code)) {
            return null;
        }

        // get rid of validation digits
        const strippedCode = CodeInformation.breakCodeParts(code).join('');

        const product = strippedCode[0];  // should be always "8"
        const segmentDigit = strippedCode[1];
        const segment = CodeInformation.companySegmentById.get(segmentDigit);
        const valueType = strippedCode[2];
        const errorCheckDigit = strippedCode[3];
        const value = (parseInt(strippedCode.substring(4, 15), 10) / 100).toFixed(2).replace('.', ',');

        const companyId = strippedCode.substring(15, 19);

        const companyName = CodeInformation.companyNameById.get(companyId);
        const freeField = strippedCode.substring(19, 44);
        // const cnpj = this.code.substring(15, 23);
        // const freeField = this.code.substring(23, 44);

        return { product, segment, segmentDigit, valueType, errorCheckDigit, value, companyId, companyName, freeField };
    }
}

CodeInformation.companySegmentById = new Map([
    ['1', 'de prefeituras'],
    ['2', 'de saneamento'],
    ['3', 'de energia elétrica e gás'],
    ['4', 'de telecomunicações'],
    ['5', 'governamental'],
    ['6', 'geral'],
    ['7', 'de multas de trânsito'],
    ['8', '--CÓDIGO RESERVADO--'],
]);

CodeInformation.companyNameById = new Map([
    ['0109', 'Live TIM'],
    ['0048', 'Vivo'],
    ['0056', 'CEG'],
    ['0053', 'Light'],
]);

class Boleto {

    constructor () {
        this.numericCodeComponent = new NumericCodeComponent('numeric-code', 'clear-button');
        this.numericCodeComponent.setCodeChangeCallback(() => this.onCodeChanged());
        this.resultDataElement = document.getElementById('result-data');

        this.allResultFields = document.querySelectorAll('#result-data li');
        this.fieldCodeValidity = document.getElementById('code-validity');
        this.fieldCodeCompanySegment = document.getElementById('code-company-segment');
        this.fieldCodeErrorVerification = document.getElementById('code-error-verification');
        this.fieldCodeVerificationDigit = document.getElementById('code-verification-digit');
        this.fieldCodeValue = document.getElementById('code-value');
        this.fieldCodeCompanyId = document.getElementById('code-company-id');
        this.fieldCodeFreeField = document.getElementById('code-free-field');

        this.sampleButton = document.getElementById('button-sample');
        this.sampleButton.addEventListener('click', () => this.loadSample());
    }

    onCodeChanged() {
        if (!this.numericCodeComponent.isComplete()) {
            this.resultDataElement.classList.add('hidden');
            return;
        }

        const result = CodeInformation.parseCode(this.numericCodeComponent.getCode());

        this.fieldCodeValidity.innerText = result !== null ? 'válido' : 'inválido';
        if (result) {
            this.fieldCodeCompanySegment.innerText = result.segment;
            this.fieldCodeVerificationDigit.innerText = result.valueType;
            this.fieldCodeErrorVerification.innerText =
                (result.valueType === '6' || result.valueType === '7') ? '10' : '11';
            this.fieldCodeValue.innerText = result.value;
            this.fieldCodeCompanyId.innerText = result.companyId;
            if (result.companyName) {
                this.fieldCodeCompanyId.innerText += ' (' + result.companyName + ')';
            }
            this.fieldCodeFreeField.innerText = result.freeField;

            for (const field of this.allResultFields) {
                field.classList.remove('hidden');
            }
        } else {
            for (const field of this.allResultFields) {
                field.classList.add('hidden');
            }
            this.fieldCodeValidity.parentNode.classList.remove('hidden');
        }

        this.resultDataElement.classList.remove('hidden');
    }

    pause() {
        return new Promise(resolve => setTimeout(resolve, 5));
    }

    async loadSample() {
        const sample = Boleto.SAMPLE_CODE;

        // do animation
        for (let i = 1; i < sample.length; i++) {
            this.numericCodeComponent.setCode(sample.slice(0, i));
            await this.pause();
        }

        this.numericCodeComponent.setCode(sample);
    }
}

Boleto.SAMPLE_CODE = '846700000009699001090116033141666515101001037833';

new Boleto();
