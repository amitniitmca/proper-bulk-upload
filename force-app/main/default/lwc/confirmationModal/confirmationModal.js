/**
 * @description       : JS file of the Confirmation Lightning Modal.
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 29-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class ConfirmationModal extends LightningModal {
    @api title;
    @api content;

    /**
    * @description Handler for the Yes button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleYes(){
        this.close('YES');
    }
    
    /**
    * @description Handler for the No button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleNo(){
        this.close('NO');
    }
}