/**
 * @description       : 
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 29-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import ConfirmationModal from 'c/confirmationModal';
import ObjectMapEditModal from 'c/objectMapEditModal';
import getStoredDetails from '@salesforce/apex/ObjectMappingDetailsController.getStoredDetails';
import deleteRecord from '@salesforce/apex/ObjectMappingDetailsController.deleteRecord';
import updateRecord from '@salesforce/apex/ObjectMappingDetailsController.updateRecord';
export default class ObjectMappingDetails extends LightningElement {

    @track columnsList = [
        {label: 'Source Field Name', fieldName: 'Source_Field_Name__c'},
        {label: 'Destination Field Name', fieldName: 'Destination_Field_Name__c'},
        {label: 'Field Type', fieldName: 'Destination_Field_Type__c'},
        {label: 'Destination Object Name', fieldName: 'Destination_Object_Name__c'},
        {label: 'Master Object Name', fieldName: 'Master_Object_Name__c'},
        {label: 'Referred Master Field Name', fieldName: 'Referred_Master_Field_Name__c'},
        {label: 'Referred Master Object Name', fieldName: 'Referred_Master_Object_Name__c'},
        // {label: 'Record Id', fieldName: 'Id'},
        {type: 'button', initialWidth: 70, typeAttributes: {label:'Edit', value:'Edit', variant:'base'}},
        {type: 'button', initialWidth: 80, typeAttributes: {label:'Delete', value:'Delete', variant:'base'}}
    ];

    pageSize;
    pageSizeOptions;

    totalRecords;
    pageNumber = 1;
    totalPages;
    recordsToShow = [];

    @track filteredDataList;

    @track dataList;
    @track wiredGetStoredDetailsResult;

    @track objectOptions = [];
    objectValue;

    @track filterFieldOptions = [];
    filterFieldValue;

    fieldValue;

    @wire(getStoredDetails)
    wiredGetStoredDetails(result){
        this.wiredGetStoredDetailsResult = result;
        const {data, error} = result;
        if(data){
            this.dataList = data;
            this.filteredDataList = this.dataList;
            this.setRecordsInfo();
            this.addObjectNames();
            this.addFilterFields();
        }
        if(error){
            console.log(error);
        }
    }

    addObjectNames(){
        let mySet = new Set();
        for(let data of this.dataList){
            mySet.add(data['Destination_Object_Name__c']);
        }
        this.objectOptions = []; 
        for(let val of mySet){
            this.objectOptions.push({label: val, value : val});
        }
        this.objectOptions.unshift({label:'SELECT OBJECT', value: '---SELECT---'});
        this.objectValue = '---SELECT---';
    }

    addFilterFields(){
        this.filterFieldOptions = [];
        for(let col of this.columnsList){
            if(col.label != undefined){
                this.filterFieldOptions.push({label: col.label, value: col.fieldName});
            }
        }
        this.filterFieldOptions.unshift({label:'SELECT FIELD', value: '---SELECT---'});
        this.filterFieldValue = '---SELECT---';
    }

    setRecordsInfo(){
        this.totalRecords = this.filteredDataList.length;
        this.setPageSizeOptions();
        this.setPagination();
    }

    setPageSizeOptions(){
        this.pageSizeOptions = [];
        for(let val=5; val <= this.totalRecords; val += 5){
            this.pageSizeOptions.push({label: val, value : ''+val});
        }
        this.pageSize = '5';
    }

    setPagination(){
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.recordsToShow = [];
        for(let index=(this.pageNumber-1)*this.pageSize; index < this.pageNumber * this.pageSize ; index++){
            if(index == this.totalRecords){
                break;
            }
            this.recordsToShow.push(this.filteredDataList[index]);
        }
    }

    handleFirstClick(){
        this.pageNumber = 1;
        this.setPagination();
    }

    handlePreviousClick(){
        this.pageNumber--;
        this.setPagination();
    }

    handleNextClick(){
        this.pageNumber++;
        this.setPagination();
    }

    handleLastClick(){
        this.pageNumber = this.totalPages;
        this.setPagination();
    }

    handlePageSizeChange(event){
        this.pageSize = event.detail.value;
        this.pageNumber = 1;
        this.setPagination();
    }

    get isFirstPage(){
        return this.pageNumber == 1;
    }

    get isLastPage(){
        return this.pageNumber == this.totalPages;
    }

    get rowOffset(){
        return (this.pageNumber-1)*this.pageSize;
    }

    get isNotDownloadable(){
        return this.objectValue == '---SELECT---';
    }

    handleObjectChange(event){
        this.objectValue = event.detail.value;
        this.filterDataByObject();
    }

    filterDataByObject(){
        if(this.objectValue != '---SELECT---'){
            this.filteredDataList = this.dataList.filter((item) => item.Destination_Object_Name__c.includes(this.objectValue));
        }
        else{
            this.filteredDataList = this.dataList;
        }
        this.setRecordsInfo();
    }

    handleFilterFieldChange(event){
        this.filterFieldValue = event.detail.value;
    }

    @api refreshData(){
        refreshApex(this.wiredGetStoredDetailsResult);
    }

    handleFieldValueChange(event){
        this.fieldValue = event.detail.value;
        if(this.filterFieldValue == '---SELECT---'){
            this.showError('Please choose Field to Filter before providing value!');
            setTimeout(() => {
                this.fieldValue = undefined;
            }, 100);
        }
    }

    handleFilterClick(){
        if(this.filterFieldValue == '---SELECT---'){
            this.showError('Please choose Field to Filter before filtering records!');
        }
        else{
            this.filteredDataList = this.dataList.filter((item) => item[this.filterFieldValue].includes(this.fieldValue));
            this.setRecordsInfo();
        }
    }

    handleResetClick(){
        this.objectValue = '---SELECT---';
        this.filterDataByObject();
        this.fieldValue = undefined;
        this.filterFieldValue = '---SELECT---';
    }

    handleDownloadClick(){
        let rowHeaders = [];
        for(let data of this.filteredDataList){
            rowHeaders.push(data.Source_Field_Name__c);
        }
        rowHeaders.sort();
        let csvString = rowHeaders.join(',');
        let downloadElement = document.createElement('a');
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        downloadElement.target = '_self';
        downloadElement.download = this.objectValue+'.csv';
        document.body.appendChild(downloadElement);
        downloadElement.click();
        this.showSuccess(this.objectValue+'.csv file downloaded successfully!');
    }

    handleRowAction(event){
        const recId = event.detail.row.Id;
        const actionName = event.detail.action.value;
        if (actionName === 'Edit') {
            this.handleEditClick(recId);
        } else {
            this.handleDeleteClick(recId);
        }
    }

    async handleEditClick(recordId){
        const record = this.getRecordOfId(recordId);
        const res = await ObjectMapEditModal.open({
            size: 'small',
            title: 'Field Edit Modal',
            destinationObjectName: record.object,
            destinationFieldName: record.desField,
            destinationFieldType: record.desType,
            sourceFieldName: record.field
        });
        if(res != 'CANCEL'){
            updateRecord({recId: recordId, sourceFieldName: res})
            .then((data) => {
                this.showSuccess('Source Field Name for '+record.desField+' field of '+record.object+' object updated successfully!');
                this.refreshData();
            })
            .catch((error) => {
                this.showError(JSON.stringify(error));
            });
        }
    }

    async handleDeleteClick(recordId){
        const record = this.getRecordOfId(recordId);
        const res = await ConfirmationModal.open({
            size: 'small',
            content: "Are you sure to delete '"+record.field+"' field of '"+record.object+"' object?",
            title: 'Delete Confirmation'
        });
        if(res == 'YES'){
            deleteRecord({recId : recordId})
            .then((data) => {
                this.showSuccess(record.field+' field of '+record.object+' object deleted successfully!');
                this.refreshData();
            })
            .catch((error) => {
                this.showError(JSON.stringify(error));
            });
        }
    }

    getRecordOfId(recordId){
        let record = {};
        for(let data of this.dataList){
            if(data.Id == recordId){
                record.field = data.Source_Field_Name__c;
                record.object = data.Destination_Object_Name__c;
                record.desField = data.Destination_Field_Name__c;
                record.desType = data.Destination_Field_Type__c;
                break;
            }
        }
        return record;
    }

    showError(message){
        this.dispatchEvent(new ShowToastEvent({title:'ERROR', message: message, variant: 'error'}));
    }

    showSuccess(message){
        this.dispatchEvent(new ShowToastEvent({title:'SUCCESS', message: message, variant: 'success'}));
    }
}