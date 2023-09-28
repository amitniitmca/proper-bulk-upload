/**
 * @description       : 
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 29-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
public with sharing class ObjectMappingDetailsController {
    
    @AuraEnabled(cacheable=true)
    public static List<Proper_Object_Mapping__c> getStoredDetails(){
        try {
            return ObjectFieldService.getAllValues();            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteRecord(String recId){
        try {
            ObjectFieldService.deleteObjectMapping(recId);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateRecord(String recId, String sourceFieldName){
        try {
            ObjectFieldService.updateSourceFieldName(recId, sourceFieldName);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}