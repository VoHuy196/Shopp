import type { Attribute, CreateAttributeInput, CreateAttributeValueInput, AttributeValue } from "../types/attribute";

const STORAGE_KEY = "ims_attributes";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AttributeService = {
    getAll: async (): Promise<Attribute[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            const initial: Attribute[] = [
                {
                    id: '1',
                    name: 'Color',
                    values: [
                        { id: '101', attributeId: '1', value: 'Red' },
                        { id: '102', attributeId: '1', value: 'Blue' },
                        { id: '103', attributeId: '1', value: 'Green' }
                    ]
                },
                {
                    id: '2',
                    name: 'Size',
                    values: [
                        { id: '201', attributeId: '2', value: 'S' },
                        { id: '202', attributeId: '2', value: 'M' },
                        { id: '203', attributeId: '2', value: 'L' },
                        { id: '204', attributeId: '2', value: 'XL' }
                    ]
                }
            ];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(data);
    },

    create: async (input: CreateAttributeInput): Promise<Attribute> => {
        await delay(500);
        const attributes = await AttributeService.getAll();
        const newAttr: Attribute = {
            id: crypto.randomUUID(),
            name: input.name,
            values: []
        };
        attributes.unshift(newAttr);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attributes));
        return newAttr;
    },

    addValue: async (input: CreateAttributeValueInput): Promise<AttributeValue> => {
        await delay(300);
        const attributes = await AttributeService.getAll();
        const attrIndex = attributes.findIndex(a => a.id === input.attributeId);
        if (attrIndex === -1) throw new Error("Attribute not found");

        const newValue: AttributeValue = {
            id: crypto.randomUUID(),
            attributeId: input.attributeId,
            value: input.value
        };

        attributes[attrIndex].values.push(newValue);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attributes));
        return newValue;
    },

    deleteValue: async (attributeId: string, valueId: string): Promise<void> => {
        await delay(300);
        const attributes = await AttributeService.getAll();
        const attrIndex = attributes.findIndex(a => a.id === attributeId);
        if (attrIndex === -1) return;

        attributes[attrIndex].values = attributes[attrIndex].values.filter(v => v.id !== valueId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attributes));
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        const attributes = await AttributeService.getAll();
        const filtered = attributes.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
};
