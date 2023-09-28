/**
 * @description       : 
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @group             : 
 * @last modified on  : 27-09-2023
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
}