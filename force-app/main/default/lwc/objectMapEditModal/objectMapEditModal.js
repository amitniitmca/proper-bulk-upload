import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class ObjectMapEditModal extends LightningModal {
    @api destinationObjectName;
    @api destinationFieldName;
    @api destinationFieldType;
    @api sourceFieldName;

    handleFieldNameChange(event){
        this.sourceFieldName = event.detail.value;
    }

    handleSave(){
        this.close(this.sourceFieldName);
    }

    handleCancel(){
        this.close('CANCEL');
    }
}