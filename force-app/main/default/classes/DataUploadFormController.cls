/**
 * @description       : 
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @group             : 
 * @last modified on  : 15-10-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
public with sharing class DataUploadFormController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String,String> getOperations(){
        try {
            return ProperBatchOperationService.getPicklistValuesOf('Operation');
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<String,String> getSeparators(){
        try {
            return ProperBatchOperationService.getPicklistValuesOf('Separator');
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void uploadRecords(List<Map<String, String>> records){
        try {
            System.debug('records : '+records);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}