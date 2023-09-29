/**
 * @description       : This class is used interact with the Object Mapping Details LWC.
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 29-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
public with sharing class ObjectMappingDetailsController {
    
    /**
    * @description This method is used to get all the stored values in the Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @return List<Proper_Object_Mapping__c> List of Proper Object Mapping records.
    **/
    @AuraEnabled(cacheable=true)
    public static List<Proper_Object_Mapping__c> getStoredDetails(){
        try {
            return ObjectFieldService.getAllValues();            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    * @description This method is used to delete record of Proper Object Mapping object of the specified record id.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param recId Record Id of the Proper Object Mapping record that is to be deleted.
    **/
    @AuraEnabled
    public static void deleteRecord(String recId){
        try {
            ObjectFieldService.deleteObjectMapping(recId);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    * @description This method is used to update the Proper Obejct Mapping record with a new Source field name.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param recId Record Id of the Proper Object Mapping record whose source field name is to be updated.
    * @param sourceFieldName The new source field name which is to be updated.
    **/
    @AuraEnabled
    public static void updateRecord(String recId, String sourceFieldName){
        try {
            ObjectFieldService.updateSourceFieldName(recId, sourceFieldName);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}