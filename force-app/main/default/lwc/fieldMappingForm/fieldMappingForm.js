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

    handleDestinationFieldChange(event){
        this.destinationFieldValue = event.detail.value;
    }

    handleSourceFieldChange(event){
        this.sourceFieldName = event.detail.value;
    }

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

    handleResetClick(){
        this.disableDestinationField = false;
        this.disableSourceField = false;
        this.disableSave =  false;
        this.disableReset = true;
        const event = new CustomEvent('reset');
        this.dispatchEvent(event);
    }

    @api resetAll(){
        this.handleResetClick();
        this.destinationFieldValue = '---SELECT---';
        this.sourceFieldName = undefined;
    }
}