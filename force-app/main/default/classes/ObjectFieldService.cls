/**
 * @description       : This class is used to get and store information from all objects and fields as well as Proper Object Mapping object.
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @last modified on  : 30-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
public with sharing class ObjectFieldService {

    /**
    * @description This method is used to get all the creatable objects in the org except for the custom objects of the package.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @return Map<String, String> Key(API name) and value (Label) of objects.
    **/
    public static Map<String, String> getAllObjects(){
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

        Map<String, String> objectInfos = new Map<String, String>();
        for (String objectName : globalDescribe.keySet()) {
            Schema.SObjectType sObjectType = globalDescribe.get(objectName);
            Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();

            if (describeResult.isCreateable() && !describeResult.getLabel().containsIgnoreCase('Proper Object Mapping')) {
                objectInfos.put(describeResult.getName(), describeResult.getLabel());
            }
        }

        return objectInfos;
    }

    /**
    * @description This method is used to get list of creatable fields of a specific object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param objectName Name of the object whose fields is to be fetched from the org.
    * @return List<ObjectFieldService.FieldInfo> List of inner class: containing API Name, Label, Data Type, Master Object Name and API name of field in Master Object.
    **/
    public static List<ObjectFieldService.FieldInfo> getFieldsOfObject(String objectName){
        List<ObjectFieldService.FieldInfo> creatableFields = new List<ObjectFieldService.FieldInfo>();

        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
        Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();

        for (Schema.SObjectField field : describeResult.fields.getMap().values()) {
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();

            if (fieldDescribe.isCreateable()) {
                ObjectFieldService.FieldInfo fieldInfo = new ObjectFieldService.FieldInfo();
                fieldInfo.fieldName = fieldDescribe.getName();
                fieldInfo.fieldLabel = fieldDescribe.getLabel();
                fieldInfo.fieldType = fieldDescribe.getType().name();
                if(fieldDescribe.getType().name() == 'Reference'){
                    fieldInfo.masterObjectName = fieldDescribe.getReferenceTo()[0].getDescribe().getName();
                    fieldInfo.masterObjectField = getRecordNameField(fieldInfo.masterObjectName);
                }
                creatableFields.add(fieldInfo);
            }
        }

        return creatableFields;
    }

    /**
    * @description This method is used to insert records in Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param records List of records to be inserted in the org.
    **/
    public static void insertObjectMappingRecords(List<Map<String, String>> records){
        List<Proper_Object_Mapping__c> objectMappings = new List<Proper_Object_Mapping__c>();
        for(Map<String, String> record : records){
            Proper_Object_Mapping__c objectMap = new Proper_Object_Mapping__c();
            objectMap.Source_Field_Name__c = record.get('sourceField');
            objectMap.Destination_Field_Name__c = record.get('destinationField');
            objectMap.Destination_Field_Type__c = record.get('fieldType');
            objectMap.Destination_Object_Name__c = record.get('objectName');
            if(record.get('masterObject') != null){
                objectMap.Master_Object_Name__c = record.get('masterObject');
                objectMap.Master_Reference_Field_Name__c = record.get('masterObjectReference');
            }
            if(record.get('referredMasterObjectName') != null){
                objectMap.Referred_Master_Object_Name__c = record.get('referredMasterObjectName');
            }
            if(record.get('referredMasterFieldName') != null){
                objectMap.Referred_Master_Field_Name__c = record.get('referredMasterFieldName');
            }
            System.debug('objectMap => '+objectMap);
            objectMappings.add(objectMap);
        }
        INSERT objectMappings;
    }

    /**
    * @description This method is used to get Destination field names of the specified object stored in the Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param objectName Name of the object whose Destination field names is to be fetched from the org.
    * @return List<String> List of Destination field names of the specified object.
    **/
    public static List<String> getStoredFieldsOfObject(String objectName){
        List<Proper_Object_Mapping__c> mappings = [SELECT Destination_Field_Name__c FROM Proper_Object_Mapping__c 
                                                    WHERE Destination_Object_Name__c = :objectName 
                                                    WITH SECURITY_ENFORCED];
        List<String> fields = new List<String>();
        for(Proper_Object_Mapping__c mapping : mappings){
            fields.add(mapping.Destination_Field_Name__c);
        }
        return fields;
    }

    /**
    * @description This method is used to get all the stored values in the Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @return List<Proper_Object_Mapping__c> List of records of the Proper Object Mapping object.
    **/
    public static List<Proper_Object_Mapping__c> getAllValues(){
        return [SELECT Id, Source_Field_Name__c, Destination_Field_Name__c, Destination_Field_Type__c, Destination_Object_Name__c, 
                Master_Object_Name__c, Master_Reference_Field_Name__c, Referred_Master_Field_Name__c, Referred_Master_Object_Name__c
                FROM Proper_Object_Mapping__c WITH SECURITY_ENFORCED ORDER BY CreatedDate DESC];
    }

    /**
    * @description This method is used to delete a specific record in the Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param recId Record Id of the record that is to be deleted from the org.
    **/
    public static void deleteObjectMapping(String recId){
        Proper_Object_Mapping__c objectMap = [SELECT Id FROM Proper_Object_Mapping__c 
                                                WHERE Id = :recId
                                                WITH SECURITY_ENFORCED];
        DELETE objectMap;
    }

    /**
    * @description This method is used to update the source field name of a specific record in the Proper Object Mapping object.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param recId Record Id of the record that is to be updated in the Proper Object Mapping object.
    * @param newName New Source Field name that is to be updated in the Proper Object Mapping object.
    **/
    public static void updateSourceFieldName(String recId, String newName){
        Proper_Object_Mapping__c objectMap = new Proper_Object_Mapping__c();
        objectMap.Id = recId;
        objectMap.Source_Field_Name__c = newName;
        UPDATE objectMap;
    }
    
    /**
    * @description This Inner Class is to store various information related to a field like, API Name, Label, Data Type, Master Object Name (Related Object) and API name of the field of Master Object Name.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    **/
    public class FieldInfo{
        @AuraEnabled public String fieldName;
        @AuraEnabled public String fieldLabel;
        @AuraEnabled public String fieldType;
        @AuraEnabled public String masterObjectName;
        @AuraEnabled public String masterObjectField;
    }

    /**
    * @description This private method is to get the record field's API name of a specific object in the org.
    * @author Amit Kumar (Proper Salesforce Tutorials) | 29-09-2023 
    * @param objectName Name of the object whose record field's API name is to be fetched. 
    * @return String API name of the record field of the object.
    **/
    private static String getRecordNameField(String objectName){
        String recordNameField;
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
        Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();

        for (Schema.SObjectField field : describeResult.fields.getMap().values()) {
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();

            if(fieldDescribe.getName() == 'Name' || fieldDescribe.isAutoNumber()){
                recordNameField = fieldDescribe.getName();
                break;
            }
        }

        return recordNameField;
    }
}