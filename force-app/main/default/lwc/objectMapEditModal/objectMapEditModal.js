/**
 * @description       : JS file of the Proper Object Mapping record Edit Lightning Modal.
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 29-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class ObjectMapEditModal extends LightningModal {
    @api destinationObjectName;
    @api destinationFieldName;
    @api destinationFieldType;
    @api sourceFieldName;

    /**
    * @description Handler for the Source field Name text box value change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleFieldNameChange(event){
        this.sourceFieldName = event.detail.value;
    }

    /**
    * @description Handler for the Save button click event, and pass the New Source Field Name.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleSave(){
        if(this.sourceFieldName != undefined && this.sourceFieldName != ''){
            this.close(this.sourceFieldName);
        }
    }

    /**
    * @description Handler for the Cancel button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleCancel(){
        this.close('CANCEL');
    }
}