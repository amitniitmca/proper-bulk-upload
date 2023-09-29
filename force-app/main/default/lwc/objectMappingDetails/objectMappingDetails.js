/**
 * @description       : JS file for Object Mapping Details LWC which is the child LWC of the Object Mapping Page LWC, i.e. to show the data table for the Proper Object Mapping records.
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 30-09-2023
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

    /**
    * @description Wired service method to get all stored records of the Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to add all the Destination object names available in the Proper Object Mapping records in a combo box.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to add all the Column Names of the Data table in a combo box.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to set information of records like total records and call other methods.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    setRecordsInfo(){
        this.totalRecords = this.filteredDataList.length;
        this.setPageSizeOptions();
        this.setPagination();
    }

    /**
    * @description This method is used to set the page size options and record size information in a combo box.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    setPageSizeOptions(){
        this.pageSizeOptions = [];
        for(let val=5; val <= this.totalRecords; val += 5){
            this.pageSizeOptions.push({label: val, value : ''+val});
        }
        this.pageSize = '5';
    }

    /**
    * @description This method is used to set pagination for the data table.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description Handler for the First button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleFirstClick(){
        this.pageNumber = 1;
        this.setPagination();
    }

    /**
    * @description Handler for the Previous button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handlePreviousClick(){
        this.pageNumber--;
        this.setPagination();
    }

    /**
    * @description Handler for the Next button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleNextClick(){
        this.pageNumber++;
        this.setPagination();
    }

    /**
    * @description Handler for the Last button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleLastClick(){
        this.pageNumber = this.totalPages;
        this.setPagination();
    }

    /**
    * @description Handler for the Record Size combo box value change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handlePageSizeChange(event){
        this.pageSize = event.detail.value;
        this.pageNumber = 1;
        this.setPagination();
    }

    /**
    * @description Getter method to return whether the data table is on the first page.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    get isFirstPage(){
        return this.pageNumber == 1;
    }

    /**
    * @description Getter method to return whether the data table is on the last page.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    get isLastPage(){
        return this.pageNumber == this.totalPages;
    }

    /**
    * @description Getter method to return the rowOffset to data table for the current page.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    get rowOffset(){
        return (this.pageNumber-1)*this.pageSize;
    }

    /**
    * @description Getter method to return whether the Download CSV button is disabled or not, depending on whether an object is selected or not.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    get isNotDownloadable(){
        return this.objectValue == '---SELECT---';
    }

    /**
    * @description Handler for the Object Name combo box change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleObjectChange(event){
        this.objectValue = event.detail.value;
        this.filterDataByObject();
    }

    /**
    * @description This method is used to filter the data in the data table according to the object name.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    filterDataByObject(){
        if(this.objectValue != '---SELECT---'){
            this.filteredDataList = this.dataList.filter((item) => item.Destination_Object_Name__c == this.objectValue || item.Master_Object_Name__c == this.objectValue);
        }
        else{
            this.filteredDataList = this.dataList;
        }
        this.setRecordsInfo();
    }

    /**
    * @description Handler for the Field (Column) Name combo box change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleFilterFieldChange(event){
        this.filterFieldValue = event.detail.value;
    }

    /**
    * @description This public method is used to refresh the data of the data table.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    @api refreshData(){
        refreshApex(this.wiredGetStoredDetailsResult);
    }

    /**
    * @description Handler for the Field value text change event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleFieldValueChange(event){
        this.fieldValue = event.detail.value;
        if(this.filterFieldValue == '---SELECT---'){
            this.showError('Please choose Field to Filter before providing value!');
            setTimeout(() => {
                this.fieldValue = undefined;
            }, 100);
        }
    }

    /**
    * @description Handler for the Filter button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleFilterClick(){
        if(this.filterFieldValue == '---SELECT---'){
            this.showError('Please choose Field to Filter before filtering records!');
        }
        else{
            this.filteredDataList = this.dataList.filter((item) => item[this.filterFieldValue].includes(this.fieldValue));
            this.setRecordsInfo();
        }
    }

    /**
    * @description Handler for the Reset button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleResetClick(){
        this.objectValue = '---SELECT---';
        this.filterDataByObject();
        this.fieldValue = undefined;
        this.filterFieldValue = '---SELECT---';
    }

    /**
    * @description Handler for the Download CSV button click event.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description Handler for the Row Action of the data table.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    handleRowAction(event){
        const recId = event.detail.row.Id;
        const actionName = event.detail.action.value;
        if (actionName === 'Edit') {
            this.handleEditClick(recId);
        } else {
            this.handleDeleteClick(recId);
        }
    }

    /**
    * @description This method is used to show the Edit Modal and update the Proper Object Mapping record with new source field name of the specific record id.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to show the Confirmation Modal and delete the Proper Object Mapping record of the specific record id.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to get Proper Object Mapping record of the specific record id.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
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

    /**
    * @description This method is used to show the error toast with the specific message.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    showError(message){
        this.dispatchEvent(new ShowToastEvent({title:'ERROR', message: message, variant: 'error'}));
    }

    /**
    * @description This method is used to show the success toast with the specific message.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    showSuccess(message){
        this.dispatchEvent(new ShowToastEvent({title:'SUCCESS', message: message, variant: 'success'}));
    }
}