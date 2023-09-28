import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class ConfirmationModal extends LightningModal {
    @api title;
    @api content;

    handleYes(){
        this.close('YES');
    }
    
    handleNo(){
        this.close('NO');
    }
}