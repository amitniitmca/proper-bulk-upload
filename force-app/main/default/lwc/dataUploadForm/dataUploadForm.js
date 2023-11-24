import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOperations from '@salesforce/apex/DataUploadFormController.getOperations';
import getSeparators from '@salesforce/apex/DataUploadFormController.getSeparators';
import uploadRecords from '@salesforce/apex/DataUploadFormController.uploadRecords';

export default class DataUploadForm extends LightningElement {
    masterObjectName;

    operationValue;
    operationOptions;
    separatorValue;
    separatorOptions;

    keyFieldName;

    fileName;

    @track records=undefined;

    @wire(getOperations)
    wiredGetOperations({data, error}){
        if(data){
            this.operationOptions = [];
            for(let key in data){
                this.operationOptions.push({label: key, value:data[key]});
            }
            this.operationOptions.unshift({label:'---SELECT OPERATION---', value:'---SELECT---'});
            this.operationValue = '---SELECT---';
        }
        if(error){
            console.log(error);
        }
    }

    @wire(getSeparators)
    wiredGetSeparators({data, error}){
        if(data){
            this.separatorOptions = [];
            for(let key in data){
                this.separatorOptions.push({label: key, value:data[key]});
            }
            this.separatorOptions.unshift({label:'---SELECT SEPARATOR---', value:'---SELECT---'});
            this.separatorValue = '---SELECT---';
        }
        if(error){
            console.log(error);
        }
    }

    get isUpdateOperation(){
        return this.operationValue == 'Update';
    }

    get isAvailableToUpload(){
        return this.records == undefined;
    }

    handleMasterObjectNameChange(event){
        this.masterObjectName = event.detail.value;
    }

    handleOperationChange(event){
        this.operationValue = event.detail.value;
    }

    handleKeyFieldChange(event){
        this.keyFieldName = event.detail.value;
    }

    handleSeparatorChange(event){
        this.separatorValue = event.detail.value;
    }

    handleCSVUpload(event){
        const files = event.detail.files;
        if(files.length > 0){
            const file = files[0];
            this.fileName = file.name;
            this.readFile(file);
        }
    }

    async readFile(file){
        try {
            const result = await this.loadFile(file);
            this.parseCSV(result);
        } catch (error) {
            console.log(error);    
        }
    }

    async loadFile(file){
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject(reader.error);
            };
            reader.readAsText(file);
        });
    }

    parseCSV(csv) {
        
        const lines = csv.split(/\r\n|\n/);
        const headers = lines[0].split(',');
        this.columns = headers.map((header) => {
          return { label: header, fieldName: header };
        });
        const data = [];
        
        lines.forEach((line, i, arr) => {
          if (i === 0 || i === arr.length-1) return;
      
          const obj = {};
          const currentLine = line.split(','); 
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
          }
          data.push(obj);
        });
        this.records = data;
        console.log(JSON.stringify(this.records));
    }

    handleUploadClick(){
        let errors = [];
        if(this.masterObjectName == undefined || this.masterObjectName == ''){
            errors.push("Please provide the master object name for uploading record!");
        }
        if(this.operationValue == '---SELECT---'){
            errors.push("Please choose an operation to perform for uploading record!");
        }
        if(this.operationValue == 'Update' && (this.keyFieldName == undefined || this.keyFieldName == '')){
            errors.push("Please provide key field name for updating and uploading record!");
        }
        if(this.separatorValue == '---SELECT---'){
            errors.push("Please choose separator character for multiple values for uploading record!");
        }
        if(errors.length > 0){
            let message = 'Please remove the following error(s)\n';
            for(let index=0; index<errors.length; index++){
                message += (index+1)+'. '+errors[index]+'\n';
            }
            this.dispatchEvent(new ShowToastEvent({title:'ERROR', message:message, variant:'error'}));
        }
        else{
            uploadRecords({records : this.records})
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }

    handleCancelClick(){
        this.records = undefined;
        this.masterObjectName = undefined;
        this.fileName = undefined;
        this.operationValue = '---SELECT---';
        this.separatorValue = '---SELECT---';

    }
}