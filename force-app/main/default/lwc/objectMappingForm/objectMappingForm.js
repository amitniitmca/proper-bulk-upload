/**
 * @description       : ObjectMappingForm LWC is used to create Proper Object Mapping Records
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 28-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
import { LightningElement, wire, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllObjects from '@salesforce/apex/ObjectMappingFormController.getAllObjects';
import getAllFieldsOfObject from '@salesforce/apex/ObjectMappingFormController.getAllFieldsOfObject';
import createObjectMapping from '@salesforce/apex/ObjectMappingFormController.createObjectMapping';
import getStoredFieldNamesOfObject from '@salesforce/apex/ObjectMappingFormController.getStoredFieldNamesOfObject';

export default class ObjectMappingForm extends LightningElement {

    objectValue;
    @track objectOptions = [];

    masterObjectValue;
    @track masterObjectOptions = [];

    isMasterObject = true;
    spinnerLoading = true;

    @track fieldDetails = [];
    @track fieldInfos = [];
    @track fieldRecords = [];
    numberOfFields = 0;
    currentField = 0;

    listOfSelectedFields = [];

    @wire(getAllObjects)
    wiredGetAllObjects({data, error}){
        if(data){
            this.objectOptions = [];
            for(let key in data){
                this.objectOptions.push({label:data[key], value:key});
            }
            this.objectOptions.unshift({label:'---Select Object---', value:'---SELECT---'});
            this.masterObjectOptions = this.objectOptions;
            this.objectValue = '---SELECT---';
            this.masterObjectValue = this.objectValue;
            this.spinnerLoading = false;
        }
        if(error){
            console.log(error);
        }
    }

    handleObjectChange(event){
        this.objectValue = event.detail.value;
        if(this.objectValue != '---SELECT---'){
            this.fieldRecords = [];
            this.numberOfFields = 0;
            this.currentField = 0;
            this.listOfSelectedFields = [];
            this.getFields();
            this.getStoredFieldNames();
        }
    }

    getFields(){
        getAllFieldsOfObject({objectName : this.objectValue})
        .then((data) => {
            this.fieldInfos = [];
            this.fieldDetails = data;
            for(let field of this.fieldDetails){
                this.fieldInfos.push({label: field.fieldLabel, value:field.fieldName});
            }
            this.fieldInfos.unshift({label:'Select field', value:'---SELECT---'});
        })
        .catch((error) => {
            this.showError(error);
        });
    }

    getStoredFieldNames(){
        getStoredFieldNamesOfObject({objectName : this.objectValue})
        .then((data) => {
            for(let field of data){
                this.listOfSelectedFields.push(field);
            }
        })
        .catch((error) => {
            this.showError(error);
        });
    }

    handleIsMasterChange(event){
        this.isMasterObject = event.detail.checked;
    }

    handleMasterObjectChange(event){
        this.masterObjectValue = event.detail.value;
        let resetFlag = false;
        if(this.masterObjectValue != '---SELECT---' && this.objectValue == '---SELECT---'){
            this.showError('Please choose Child Object before selecting Master Object!');
            resetFlag = true;
        }
        else if(this.masterObjectValue == this.objectValue){
            this.showError('Master and Child Object cannot be same!');
            resetFlag = true;
        }
        else{
            this.fieldRecords = [];
            this.numberOfFields = 0;
            this.currentField = 0;
            this.listOfSelectedFields = [];
        }
        if(resetFlag){
            setTimeout(() => {
                this.masterObjectValue = '---SELECT---';
            }, 100);
        }
    }

    handleAddFieldClick(){
        if(this.objectValue == '---SELECT---'){
            this.showError('Please choose object for mapping before adding field!');
        }
        else if(this.isMasterObject == false && this.masterObjectValue == '---SELECT---'){
            this.showError('Please choose master object before adding field!');
        }
        else{
            this.numberOfFields++;
            for(let index = this.currentField+1; index <= this.numberOfFields; index++){
                this.fieldRecords.push({id:index, saved:false});
                this.currentField++;
            }
        }
    }

    handleDeleteFieldClick(){
        if(this.numberOfFields != 0){
            this.numberOfFields--;
        }
        if(this.currentField != 0){
            this.currentField--;
        }
        if(this.fieldRecords.length > 0){
            this.fieldRecords.pop();
        }
        else{
            this.showError('No field available to delete!');
        }
    }

    showSuccess(message){
        this.dispatchEvent(new ShowToastEvent({title:'SUCCESS', message:message, variant:'success'}));
    }

    showError(message){
        this.dispatchEvent(new ShowToastEvent({title:'ERROR', message:message, variant:'error'}));
    }

    handleFieldSaved(event){
        const fieldId = event.currentTarget.dataset.id;
        if(this.listOfSelectedFields.includes(event.detail.destinationField)){
            this.showError(event.detail.destinationField+' field has already been added!');
            this.template.querySelector('c-field-mapping-form[data-id="'+fieldId+'"]').resetAll();
        }
        else{
            for(let field of this.fieldRecords){
                if(field.id == fieldId){
                    field.saved = true;
                    this.listOfSelectedFields.push(event.detail.destinationField);
                    field.destinationField = event.detail.destinationField;
                    field.sourceField = event.detail.sourceField;
                    field.objectName = this.objectValue;
                    if(this.isMasterObject == false){
                        field.masterObject = this.masterObjectValue;
                    }
                    else{
                        field.masterObject = null;
                    }
                    let record = this.getFieldDetails(field.destinationField);
                    field.fieldType = record.fieldType;
                    field.referredMasterObjectName = record.referredMasterObjectName;
                    field.referredMasterFieldName = record.referredMasterFieldName;
                    break;
                }
            }
        }
    }

    handleFieldReset(event){
        const fieldId = event.currentTarget.dataset.id;
        for(let field of this.fieldRecords){
            if(field.id == fieldId){
                field.saved = false;
                field.destinationField = undefined;
                field.sourceField = undefined;
                field.objectName = undefined;
                field.masterObject = undefined;
                field.fieldType = undefined;
                field.referredMasterObjectName = undefined;
                field.referredMasterFieldName = undefined;
                break;
            }
        }
    }

    getFieldDetails(apiName){
        let record = {};
        for(let field of this.fieldDetails){
            if(field.fieldName == apiName){
                record.fieldType = field.fieldType;
                record.referredMasterObjectName = field.masterObjectName;
                record.referredMasterFieldName = field.masterObjectField;
                break;
            }
        }
        return record;
    }

    handleCreateClick(){
        if(this.objectValue == '---SELECT---'){
            this.showError('Please "Choose Object for Mapping" for creating Object Mapping!');
        }
        else if(this.isMasterObject == false && this.masterObjectValue == '---SELECT---'){
            this.showError('Please "Choose Master Object" for creating Object Mapping!');
        }
        else if(this.numberOfFields = 0){
            this.showError('Please provide at least 1 field for creating Object Mapping!');
        }
        else if(this.isAllFieldsSaved() == false){
            this.showError('Please save all fields first, for creating Object Mapping!');
        }
        else{
            createObjectMapping({records : this.fieldRecords})
            .then((data) => {
                this.showSuccess(this.fieldRecords.length+' fields of '+this.objectValue+' mapped successfully!');
                this.dispatchEvent(new CustomEvent('added'));
                this.handleCancelClick();
            })
            .catch((error) => {
                this.showError(error.getMessage());
            });
        }
    }

    handleCancelClick(){
        this.fieldRecords = [];
        this.numberOfFields = 0;
        this.currentField = 0;
        this.listOfSelectedFields = [];
        this.isMasterObject = true;
        this.objectValue = '---SELECT---';
        this.masterObjectValue = '---SELECT---';
    }

    isAllFieldsSaved(){
        let saved = true;
        for(let field of this.fieldRecords){
            if(field.saved == false){
                saved = false;
                break;
            }
        }
        return saved;
    }
}