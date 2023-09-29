/**
 * @description       : This class is used to interact with Object Mapping Form LWC.
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 29-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
public with sharing class ObjectMappingFormController {

    /**
    * @description This method is used to get all the creatable objects in the org except for the custom objects of the package.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @return Map<String, String> Key(API name) and value (Label) of objects.
    **/
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getAllObjects(){
        try {
            return ObjectFieldService.getAllObjects();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    * @description This method is used to get list of creatable fields of a specific object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param objectName Name of the object whose fields is to be fetched from the org.
    * @return List<ObjectFieldService.FieldInfo> List of inner class: containing API Name, Label, Data Type, Master Object Name and API name of field in Master Object.
    **/
    @AuraEnabled
    public static List<ObjectFieldService.FieldInfo> getAllFieldsOfObject(String objectName){
        try {
            List<ObjectFieldService.FieldInfo> fieldInfoList = ObjectFieldService.getFieldsOfObject(objectName);
            return fieldInfoList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    /**
    * @description This method is used to insert records in Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param records List of records to be inserted in the org.
    **/
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

    /**
    * @description This method is used to get Destination field names of the specified object stored in the Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param objectName Name of the object whose Destination field names is to be fetched from the org.
    * @return List<String> List of Destination field names of the specified object.
    **/
    @AuraEnabled
    public static List<String> getStoredFieldNamesOfObject(String objectName){
        try {
            return ObjectFieldService.getStoredFieldsOfObject(objectName);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}