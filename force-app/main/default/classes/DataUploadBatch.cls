public with sharing class DataUploadBatch implements Database.Batchable<Map<String, String>>, Database.Stateful{

    private List<Map<String, String>> records;
    private String operation;
    private String masterObjectName;
    private String keyFieldName;
    private String separator;
    private String selectedFileName;

    private Id batchOperationId;
    private List<Proper_Batch_Operation_Result__c> batchOperationResults = new List<Proper_Batch_Operation_Result__c>();

    public DataUploadBatch(List<Map<String, String>> records, Map<String, String> details){
        this.records = records;
        this.operation = details.get('operation');
        this.masterObjectName = details.get('masterObjectName');
        if(details.get('keyFieldName') != null){
            this.keyFieldName = details.get('keyFieldName');
        }
        this.separator = details.get('separator');
        this.selectedFileName = details.get('selectedFileName');
        try {
            Proper_Batch_Operation__c batchOperation = new Proper_Batch_Operation__c();
            batchOperation.Batch_File_Name__c = this.selectedFileName;
            if(this.keyFieldName != null){
                batchOperation.Key_Field_Name__c = this.keyFieldName;
            }
            batchOperation.Master_Object_Name__c = this.masterObjectName;
            batchOperation.Operation__c = this.operation;
            batchOperation.Separator__c = this.separator;
            INSERT batchOperation;
            this.batchOperationId = batchOperation.Id;
        } catch(Exception e) {
            System.debug(e.getMessage());
        }
    }

    public Iterable<Map<String,String>> start(Database.BatchableContext ctx){
        return records;
    }

    public void execute(Database.BatchableContext ctx, List<Map<String,String>> scope){
        List<ObjectFieldService.RecordInfo> masterRecordsList = ObjectFieldService.getMasterObjectFieldMapping(scope, this.masterObjectName);
        List<ObjectFieldService.RecordInfo> childRecordsList = ObjectFieldService.getChildObjectsFieldMapping(scope, this.masterObjectName);
        if(this.operation == 'Insert'){
            List<SObject> masterRecords = createMasterRecords(masterRecordsList);
            for(SObject mr : masterRecords){
                System.debug('masterRecord : '+mr);
            }
            List<Database.SaveResult> masterResults = Database.insert(masterRecords, false);
            for(Database.SaveResult res : masterResults){
                System.debug('masterResult : '+res);
            }
            List<Id> masterRecordIds = new List<Id>();
            for(Database.SaveResult result : masterResults){
                Proper_Batch_Operation_Result__c operationResult = new Proper_Batch_Operation_Result__c();
                operationResult.Batch_Operation__c = batchOperationId;
                operationResult.Is_Parent__c = true;
                operationResult.Object_Name__c = this.masterObjectName;
                if(result.isSuccess()){
                    masterRecordIds.add(result.getId());
                    operationResult.Record_Id__c = result.getId();
                    operationResult.Result__c = 'Success';
                }
                else{
                    masterRecordIds.add(null);
                    Database.Error error = result.getErrors()[0];
                    String errorMessage = 'Status Code: '+error.getStatusCode()+
                    ', Fields: '+error.getFields()+
                    ', Message: '+error.getMessage();
                    operationResult.Result__c = 'Error';
                    operationResult.Error_Message__c = errorMessage;
                }
                batchOperationResults.add(operationResult);
            }
            List<String> childObjectNames = new List<String>(); 
            List<SObject> childRecords = createChildRecords(childRecordsList, masterRecordIds, childObjectNames);
            for(SObject cr : childRecords){
                System.debug('childRecord : '+cr);
            }      
            List<Database.SaveResult> childResults = Database.insert(childRecords, false);
            Integer index=0;
            for(Database.SaveResult result : childResults){
                Proper_Batch_Operation_Result__c operationResult = new Proper_Batch_Operation_Result__c();
                operationResult.Batch_Operation__c = batchOperationId;
                operationResult.Is_Parent__c = false;
                operationResult.Object_Name__c = childObjectNames.get(index);
                index++;
                if(result.isSuccess()){
                    operationResult.Record_Id__c = result.getId();
                    operationResult.Result__c = 'Success';
                }
                else{
                    Database.Error error = result.getErrors()[0];
                    String errorMessage = 'Status Code: '+error.getStatusCode()+
                    ', Fields: '+error.getFields()+
                    ', Message: '+error.getMessage();
                    operationResult.Result__c = 'Error';
                    operationResult.Error_Message__c = errorMessage;
                }
                batchOperationResults.add(operationResult);
            }
        }
        // else if(this.operation == 'Update'){

        // }
    }

    public void finish(Database.BatchableContext ctx){
        try {
            INSERT batchOperationResults;
        } catch(Exception e) {
            System.debug(e.getMessage());
        }
        Id jobId = ctx.getJobId();
        String email = [SELECT Id, CreatedBy.Email FROM AsyncApexJob WHERE Id = :jobId].CreatedBy.Email;
        String baseUrl = URL.getSalesforceBaseUrl().toExternalForm();
        String message = '<h2> Following Data uploaded Successfully </h2> <br>';
        message += '<ul>';
        message += '<li> Parent Records (Success) <ul>';
        Integer count = 1;
        for(Proper_Batch_Operation_Result__c result : batchOperationResults){
            if(result.Is_Parent__c == true && result.Result__c == 'Success'){
                message += '<li><a href="'+baseUrl+'/lightning/r/'+result.Object_Name__c+'/'+result.Record_Id__c+'/view">'+result.Object_Name__c+' Record '+count+'</a></li>';
                count++;
            }
        }
        message += '</ul> </li>';
        message += '<li> Child Records (Success) <ul>';
        count = 1;
        for(Proper_Batch_Operation_Result__c result : batchOperationResults){
            if(result.Is_Parent__c == false && result.Result__c == 'Success'){
                message += '<li><a href="'+baseUrl+'/lightning/r/'+result.Object_Name__c+'/'+result.Record_Id__c+'/view">'+result.Object_Name__c+' Record '+count+'</a></li>';
                count++;
            }
        }
        message += '</ul> </li>';
        message += '<li> Parent Records (Failure) <ul>';
        count = 1;
        for(Proper_Batch_Operation_Result__c result : batchOperationResults){
            if(result.Is_Parent__c == true && result.Result__c == 'Error'){
                message += '<li>'+result.Object_Name__c+', ERROR: '+result.Error_Message__c+'</li>';
                count++;
            }
        }
        message += '</ul> </li>';
        message += '<li> Child Records (Failure) <ul>';
        count = 1;
        for(Proper_Batch_Operation_Result__c result : batchOperationResults){
            if(result.Is_Parent__c == true && result.Result__c == 'Error'){
                message += '<li>'+result.Object_Name__c+', ERROR: '+result.Error_Message__c+'</li>';
                count++;
            }
        }
        message += '</ul> </li>';
        message += '</ul>';

        Messaging.SingleEmailMessage sem = new Messaging.SingleEmailMessage();
        sem.setSubject('Proper Data Uploaded Successfully');
        sem.setHtmlBody(message);
        sem.setToAddresses(new List<String>{email});
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{sem});
    }

    private List<SObject> createMasterRecords(List<ObjectFieldService.RecordInfo> masterRecordsList){
        List<SObject> masterRecords = new List<SObject>();
        for(Integer index=1; index<=masterRecordsList.get(0).maxRecordNo; index++){
            SObject masterRecord = Schema.getGlobalDescribe().get(this.masterObjectName).newSObject();
            for(ObjectFieldService.RecordInfo record : masterRecordsList){
                if(record.recordNo == index){
                    masterRecord.put(record.recordName, record.recordValue);
                }
            }
            masterRecords.add(masterRecord); 
        }
        return masterRecords;
    }

    private List<SObject> createChildRecords(List<ObjectFieldService.RecordInfo> childRecordsList, List<Id> masterRecordIds, List<String> childObjectNames){
        List<SObject> childRecords = new List<SObject>();
        Map<String, Map<String, String>> referencedValues = ObjectFieldService.getValueOfReferencedFields(this.masterObjectName);
        Map<Integer, List<ObjectFieldService.RecordInfo>> multiRecordsList = new Map<Integer, List<ObjectFieldService.RecordInfo>>();
        for(Integer index=1; index<=childRecordsList.get(0).maxRecordNo; index++){
            if(masterRecordIds.get(index-1) != null){
                SObject childRecord = null;
                String childObjectName = null;
                for(ObjectFieldService.RecordInfo record : childRecordsList){
                    if(record.recordNo == index){
                        if(String.valueOf(record.recordValue).contains(this.separator)){
                            if(!multiRecordsList.containsKey(index)){
                                multiRecordsList.put(index, new List<ObjectFieldService.RecordInfo>());
                            }
                            multiRecordsList.get(index).add(record);
                            System.debug('multiRecordsList : '+multiRecordsList);
                        }
                        else{
                            if(childRecord == null){
                                childRecord = Schema.getGlobalDescribe().get(record.objectName).newSObject();
                                childObjectName = record.objectName;
                            }
                            if(childRecord.get(record.masterObjectReferenceName) == null){
                                childRecord.put(record.masterObjectReferenceName, masterRecordIds.get(index-1));
                            }
                            if(record.recordType.equalsIgnoreCase('reference')){
                                childRecord.put(record.recordName, referencedValues.get(record.referencedObjectName).get(String.valueOf(record.recordValue)));
                            }
                            else{
                                childRecord.put(record.recordName, getValue(record.recordType, String.valueOf(record.recordValue)));
                            }
                        }
                    }
                }
                childObjectNames.add(childObjectName);
                childRecords.add(childRecord);
            }
        }

        if(multiRecordsList.size() > 0){
            for(Integer index=1; index<=childRecordsList.get(0).maxRecordNo; index++){
                if(masterRecordIds.get(index-1) != null){
                    List<SObject> childRecs = new List<SObject>();
                    String childObjectName = null;
                    for(ObjectFieldService.RecordInfo record : multiRecordsList.get(index)){
                        String []values = String.valueOf(record.recordValue).split('\\'+this.separator);
                        for(Integer i=0; i<values.size(); i++){
                            if(childRecs.size()-1 < i){
                                childRecs.add(Schema.getGlobalDescribe().get(record.objectName).newSObject());
                                childObjectName = record.objectName;
                            }
                            if(record.recordType.equalsIgnoreCase('reference')){
                                childRecs.get(i).put(record.recordName, referencedValues.get(record.referencedObjectName).get(values[i]));
                            }
                            else{
                                childRecs.get(i).put(record.recordName, getValue(record.recordType, values[i]));
                            }
                            if(childRecs.get(i).get(record.masterObjectReferenceName) == null){
                                childRecs.get(i).put(record.masterObjectReferenceName, masterRecordIds.get(index-1));
                            }
                        }               
                    }
                    childObjectNames.add(childObjectName);
                    childRecords.addAll(childRecs);
                }
            }
        }
        return childRecords;
    }

    private static Object getValue(String recordType, String value){
        switch on recordType.toLowerCase() {
            when 'address', 'combobox', 'datacategorygroupreference', 'email', 'encryptedstring', 'id',
                'location', 'multipicklist', 'phone', 'picklist', 'reference', 'string', 'textarea', 'url' {
                return value;
            }
            when 'base64' {
                return Blob.valueOf(value);   
            }
            when 'boolean' {
                return Boolean.valueOf(value);
            }
            when 'currency', 'double', 'percent' {
                return Decimal.valueOf(value);
            }
            when 'date' {
                return Date.valueOf(value);
            }
            when 'datetime' {
                return Datetime.valueOf(value);
            }
            when 'integer' {
                return Integer.valueOf(value);
            }
            when 'long' {
                return Long.valueOf(value);
            }
            when 'time' {
                return Time.newInstance(Integer.valueOf(value.split(':')[0]), Integer.valueOf(value.split(':')[1]), 0,0);
            }
            when else{
                return null;
            }
        }
    }
}