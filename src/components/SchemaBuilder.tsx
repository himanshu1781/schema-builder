import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

// Define types for our schema
interface SchemaField {
  id: string;
  key: string;
  type: 'string' | 'number' | 'integer' | 'float' | 'boolean' | 'array' | 'object' | 'date' | 'datetime' | 'email' | 'url' | 'text' | 'password' | 'enum' | 'nested';
  required: boolean;
  children?: SchemaField[];
}

const SchemaBuilder = () => {
  const [fields, setFields] = useState<SchemaField[]>([
    { id: 'field_1', key: 'name', type: 'string', required: false, children: [] },
    { id: 'field_2', key: 'class', type: 'number', required: false, children: [] },
    { id: 'field_3', key: 'address', type: 'nested', required: false, children: [
      { id: 'field_4', key: 'hno', type: 'number', required: false, children: [] },
      { id: 'field_5', key: 'city', type: 'string', required: false, children: [] },
      { id: 'field_6', key: 'pin', type: 'number', required: false, children: [] },
      { id: 'field_7', key: 'landmark', type: 'nested', required: false, children: [
        { id: 'field_8', key: 'nearby', type: 'string', required: false, children: [] }
      ]}
    ]}
  ]);

  // Generate unique ID for new fields
  const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Recursive function to find and update field by ID
  const findAndUpdateField = (fields: SchemaField[], fieldId: string, updater: (field: SchemaField) => SchemaField): SchemaField[] => {
    return fields.map(field => {
      if (field.id === fieldId) {
        return updater(field);
      }
      if (field.children && field.children.length > 0) {
        return {
          ...field,
          children: findAndUpdateField(field.children, fieldId, updater)
        };
      }
      return field;
    });
  };

  // Recursive function to find and delete field by ID
  const findAndDeleteField = (fields: SchemaField[], fieldId: string): SchemaField[] => {
    return fields.filter(field => field.id !== fieldId).map(field => {
      if (field.children && field.children.length > 0) {
        return {
          ...field,
          children: findAndDeleteField(field.children, fieldId)
        };
      }
      return field;
    });
  };

  // Recursive function to find parent and add child
  const findAndAddChild = (fields: SchemaField[], parentId: string, newField: SchemaField): SchemaField[] => {
    return fields.map(field => {
      if (field.id === parentId) {
        return {
          ...field,
          children: [...(field.children || []), newField]
        };
      }
      if (field.children && field.children.length > 0) {
        return {
          ...field,
          children: findAndAddChild(field.children, parentId, newField)
        };
      }
      return field;
    });
  };

  // Update field key
  const updateFieldKey = (fieldId: string, newKey: string) => {
    setFields(currentFields => 
      findAndUpdateField(currentFields, fieldId, field => ({
        ...field,
        key: newKey
      }))
    );
  };

  // Update field type
  const updateFieldType = (fieldId: string, newType: SchemaField['type']) => {
    setFields(currentFields => 
      findAndUpdateField(currentFields, fieldId, field => ({
        ...field,
        type: newType,
        children: newType === 'nested' || newType === 'object' || newType === 'array' ? field.children || [] : []
      }))
    );
  };

  // Toggle required status
  const toggleRequired = (fieldId: string) => {
    setFields(currentFields => 
      findAndUpdateField(currentFields, fieldId, field => ({
        ...field,
        required: !field.required
      }))
    );
  };

  // Add field
  const addField = (parentId?: string) => {
    const newField: SchemaField = {
      id: generateId(),
      key: 'newField',
      type: 'string',
      required: false,
      children: []
    };

    if (parentId) {
      setFields(currentFields => findAndAddChild(currentFields, parentId, newField));
    } else {
      setFields(currentFields => [...currentFields, newField]);
    }
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    setFields(currentFields => findAndDeleteField(currentFields, fieldId));
  };

  // Generate sample JSON output
  const generateSampleData = (fields: SchemaField[]): any => {
    const data: any = {};
    
    fields.forEach(field => {
      switch (field.type) {
        case 'string':
          data[field.key] = "STRING";
          break;
        case 'number':
          data[field.key] = "number";
          break;
        case 'integer':
          data[field.key] = 42;
          break;
        case 'float':
          data[field.key] = 3.14;
          break;
        case 'boolean':
          data[field.key] = true;
          break;
        case 'array':
          data[field.key] = field.children && field.children.length > 0 ? [generateSampleData(field.children)] : ["item1", "item2"];
          break;
        case 'object':
        case 'nested':
          data[field.key] = field.children && field.children.length > 0 ? generateSampleData(field.children) : {};
          break;
        case 'date':
          data[field.key] = "2025-07-21";
          break;
        case 'datetime':
          data[field.key] = "2025-07-21T10:30:00Z";
          break;
        case 'email':
          data[field.key] = "user@example.com";
          break;
        case 'url':
          data[field.key] = "https://example.com";
          break;
        case 'text':
          data[field.key] = "This is a longer text content";
          break;
        case 'password':
          data[field.key] = "********";
          break;
        case 'enum':
          data[field.key] = "option1";
          break;
        default:
          data[field.key] = "unknown";
      }
    });

    return data;
  };

  // Handle form submission
  const handleSubmit = () => {
    const sampleData = generateSampleData(fields);
    console.log('Generated Schema Data:', sampleData);
    alert('Schema submitted successfully! Check console for details.');
  };

  // Field component
  const FieldRow = ({ field, level = 0 }: { field: SchemaField; level?: number; }) => {
    const isNestable = field.type === 'nested' || field.type === 'object' || field.type === 'array';
    const marginLeft = level * 20;

    return (
      <div key={field.id} className="mb-2" style={{ marginLeft: `${marginLeft}px` }}>
        <div className="flex items-center gap-2 mb-2">
          <input
            value={field.key}
            onChange={(e) => updateFieldKey(field.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white flex-1 max-w-xs"
            placeholder="Field name"
            type="text"
          />
          
          <select
            value={field.type}
            onChange={(e) => updateFieldType(field.id, e.target.value as SchemaField['type'])}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white min-w-32"
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="integer">integer</option>
            <option value="float">float</option>
            <option value="boolean">boolean</option>
            <option value="array">array</option>
            <option value="object">object</option>
            <option value="nested">nested</option>
            <option value="date">date</option>
            <option value="datetime">datetime</option>
            <option value="email">email</option>
            <option value="url">url</option>
            <option value="text">text</option>
            <option value="password">password</option>
            <option value="enum">enum</option>
          </select>

          <div className="flex items-center gap-1">
            <div 
              onClick={() => toggleRequired(field.id)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                field.required ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${
                field.required ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </div>
            
            <button
              onClick={() => deleteField(field.id)}
              className="p-1 text-gray-600 hover:text-red-600"
              title="Delete field"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {isNestable && field.children && field.children.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 pl-4">
            {field.children.map((child) => (
              <FieldRow
                key={child.id}
                field={child}
                level={level + 1}
              />
            ))}
          </div>
        )}

        {isNestable && (
          <div className="ml-4 mt-2">
            <button
              onClick={() => addField(field.id)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
              type="button"
            >
              + Add Item
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Form Builder */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              {fields.map((field) => (
                <FieldRow key={field.id} field={field} />
              ))}
              
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => addField()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  type="button"
                >
                  + Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - JSON Preview */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-auto" style={{ height: '400px' }}>
              <pre>{JSON.stringify(generateSampleData(fields), null, 2)}</pre>
            </div>
          </div>
        </div>
        
        {/* Submit Button at Bottom */}
        <div className="mt-6 flex justify-start">
          <button
            onClick={handleSubmit}
            className="bg-gray-600 text-white py-2 px-6 rounded text-sm hover:bg-gray-700 transition-colors"
            type="button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemaBuilder;