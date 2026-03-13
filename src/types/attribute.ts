export interface AttributeValue {
    id: string;
    attributeId: string;
    value: string;
}

export interface Attribute {
    id: string;
    name: string;
    values: AttributeValue[];
}

export interface CreateAttributeInput {
    name: string;
}

export interface CreateAttributeValueInput {
    attributeId: string;
    value: string;
}
