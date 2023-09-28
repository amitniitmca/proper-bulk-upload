import { LightningElement } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import ProperResource from '@salesforce/resourceUrl/ProperResource';

export default class ObjectMappingPage extends LightningElement {

    handleOnAdded(){
        this.template.querySelector('c-object-mapping-details').refreshData();
    }

    connectedCallback(){
        loadStyle(this, ProperResource+'/style.css');
        loadStyle(this, ProperResource+'/NoHeader.css');
        loadStyle(this, ProperResource+'/MultiLineToast.css');
    }
}