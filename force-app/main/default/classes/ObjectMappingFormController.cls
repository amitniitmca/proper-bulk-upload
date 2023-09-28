/**
 * @description       : 
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 27-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
public with sharing class ObjectMappingFormController {

    @AuraEnabled(cacheable=true)
    public static Map<String, String> getAllObjects(){
        try {
            return ObjectFieldService.getAllObjects();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<ObjectFieldService.FieldInfo> getAllFieldsOfObject(String objectName){
        try {
            List<ObjectFieldService.FieldInfo> fieldInfoList = ObjectFieldService.getFieldsOfObject(objectName);
            return fieldInfoList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void createObjectMapping(List<Map<String,String>> records){
        try {
            ObjectFieldService.insertObjectMappingRecords(records);
        } catch (Exception e) {
            System.debug(e);
            System.debug(e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<String> getStoredFieldNamesOfObject(String objectName){
        try {
            return ObjectFieldService.getStoredFieldsOfObject(objectName);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}