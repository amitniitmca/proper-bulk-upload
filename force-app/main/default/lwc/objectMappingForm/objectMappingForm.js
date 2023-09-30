/**
 * @description       : JS file of the Object Mapping Form LWC which is the child LWC of the Object Mapping Page LWC, i.e. to create Proper Object Mapping record.
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 30-09-2023
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

    /**
    * @description Wired service method to get all the creatable objects in the org except for the custom objects of the package.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description Handler for the Object Name combo box change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to get all creatable fields of the selected object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to get all the stored destination field names in the records of the Proper Object Mapping object for the selected object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description Handler for the Is Master checkbox change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleIsMasterChange(event){
        this.isMasterObject = event.detail.checked;
    }

    /**
    * @description Handler for the Master Object combo box value change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description Handler for the Add Field button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description Handler for the Delete Field button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to show the success toast of the specific message.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    showSuccess(message){
        this.dispatchEvent(new ShowToastEvent({title:'SUCCESS', message:message, variant:'success'}));
    }

    /**
    * @description This method is used to show the error toast of the specific message.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    showError(message){
        this.dispatchEvent(new ShowToastEvent({title:'ERROR', message:message, variant:'error'}));
    }

    /**
    * @description Handler for the Save button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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
                        field.masterObjectReference = this.getMasterReference(this.masterObjectValue);
                        console.log('1 ==> '+field.masterObjectReference);
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

    /**
    * @description Handler for the Reset button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleFieldReset(event){
        const fieldId = event.currentTarget.dataset.id;
        for(let field of this.fieldRecords){
            if(field.id == fieldId){
                field.saved = false;
                this.listOfSelectedFields = this.listOfSelectedFields.filter(text => text != field.destinationField);
                field.destinationField = undefined;
                field.sourceField = undefined;
                field.objectName = undefined;
                field.masterObject = undefined;
                field.masterObjectReference = undefined;
                field.fieldType = undefined;
                field.referredMasterObjectName = undefined;
                field.referredMasterFieldName = undefined;
                break;
            }
        }
    }

    /**
    * @description This method is used to get information of the field API name for the master object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    getMasterReference(masterObjectName){
        let fieldAPI = '';
        for(let field of this.fieldDetails){
            console.log('0 ==> '+field.masterObjectName);
            if(field.masterObjectName == masterObjectName){
                console.log('2 ==> '+field.referredMasterObjectName);
                fieldAPI = field.fieldName;
                console.log('3 ==> '+field.fieldName);
                break;
            }
        }
        return fieldAPI;
    }

    /**
    * @description This method is used to get information of the field for the specified field API name.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description Handler for the Create button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description Handler for the Cancel button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleCancelClick(){
        this.fieldRecords = [];
        this.numberOfFields = 0;
        this.currentField = 0;
        this.listOfSelectedFields = [];
        this.isMasterObject = true;
        this.objectValue = '---SELECT---';
        this.masterObjectValue = '---SELECT---';
    }

    /**
    * @description This method is used to check whether all the fields added are saved or not.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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