/**
 * @description       : JS file of the Field Mapping LWC, which is the child component for the Object Mapping Form LWC.
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 29-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FieldMappingForm extends LightningElement {
    destinationFieldValue = '---SELECT---';
    @api destinationFieldOptions;
    sourceFieldName;

    disableDestinationField = false;
    disableSourceField = false;
    disableSave = false;
    disableReset = true;

    /**
    * @description Handler for the Destination field Combo box value change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleDestinationFieldChange(event){
        this.destinationFieldValue = event.detail.value;
    }

    /**
    * @description Handler for the Source field text box value change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleSourceFieldChange(event){
        this.sourceFieldName = event.detail.value;
    }

    /**
    * @description Handler for the Save button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleSaveClick(){
        if(this.destinationFieldValue == '---SELECT---'){
            this.dispatchEvent(new ShowToastEvent({title:'Error', message: 'Destination field should be selected to save field!', variant:'error'}));
        }
        else if(this.sourceFieldName == undefined){
            this.dispatchEvent(new ShowToastEvent({title:'Error', message: 'Source field should be provided to save field!', variant:'error'}));
        }
        else{
            this.disableDestinationField = true;
            this.disableSourceField = true;
            this.disableSave =  true;
            this.disableReset = false;
            const event = new CustomEvent('saved', {detail : {destinationField : this.destinationFieldValue, sourceField : this.sourceFieldName}});
            this.dispatchEvent(event);
        }
    }

    /**
    * @description Handler for the Reset button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleResetClick(){
        this.disableDestinationField = false;
        this.disableSourceField = false;
        this.disableSave =  false;
        this.disableReset = true;
        const event = new CustomEvent('reset');
        this.dispatchEvent(event);
    }

    /**
    * @description This public method is used to reset all the values of the components of this LWC.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    @api resetAll(){
        this.handleResetClick();
        this.destinationFieldValue = '---SELECT---';
        this.sourceFieldName = undefined;
    }
}