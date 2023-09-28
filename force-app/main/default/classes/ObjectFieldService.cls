/**
 * @description       : 
 * @author            : Amit Kumar (Proper Salesforce Tutorials)
 * @group             : 
 * @last modified on  : 29-09-2023
 * @last modified by  : Amit Kumar (Proper Salesforce Tutorials)
**/
public with sharing class ObjectFieldService {

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

    public static List<Proper_Object_Mapping__c> getAllValues(){
        return [SELECT Id, Source_Field_Name__c, Destination_Field_Name__c, Destination_Field_Type__c, 
                Destination_Object_Name__c, Master_Object_Name__c, Referred_Master_Field_Name__c, Referred_Master_Object_Name__c
                FROM Proper_Object_Mapping__c WITH SECURITY_ENFORCED ORDER BY CreatedDate DESC];
    }

    public static void deleteObjectMapping(String recId){
        Proper_Object_Mapping__c objectMap = [SELECT Id FROM Proper_Object_Mapping__c 
                                                WHERE Id = :recId
                                                WITH SECURITY_ENFORCED];
        DELETE objectMap;
    }

    public static void updateSourceFieldName(String recId, String newName){
        Proper_Object_Mapping__c objectMap = new Proper_Object_Mapping__c();
        objectMap.Id = recId;
        objectMap.Source_Field_Name__c = newName;
        UPDATE objectMap;
    }
    
    public class FieldInfo{
        @AuraEnabled public String fieldName;
        @AuraEnabled public String fieldLabel;
        @AuraEnabled public String fieldType;
        @AuraEnabled public String masterObjectName;
        @AuraEnabled public String masterObjectField;
    }

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