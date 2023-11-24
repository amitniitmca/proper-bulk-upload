/**
 * @description       : 
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @group             : 
 * @last modified on  : 15-10-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
public with sharing class ProperBatchOperationService {
    
    public static Map<String, String> getPicklistValuesOf(String fieldName){
        Schema.DescribeSObjectResult objResult = Proper_Batch_Operation__c.SObjectType.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = objResult.fields.getMap();
        Map<String, String> picklistValues = new Map<String, String>();
        for(String key : fieldMap.keySet()){
            Schema.DescribeFieldResult fieldResult = fieldMap.get(key).getDescribe();
            if(fieldResult.getLabel() == fieldName){
                List<Schema.PicklistEntry> entries = fieldResult.getPicklistValues();
                for(Schema.PicklistEntry entry : entries){
                    picklistValues.put(entry.getlabel(), entry.getValue());
                }
            }
        }
        return picklistValues;
    }
}