

import {Type, ITypeParams} from "./Type";
import {invalidValuesAsString, isObject, eol} from "../utils";

interface IObjectTypeParams extends ITypeParams {
    nullAsEmpty?: boolean;
    emptyAsNull?: boolean;
    element?: any;
}

class ObjectType extends Type {

    public static prepareDescription(description, key) {
        const isObjectDescription = (
            description.type &&
            typeof description.type === "object" &&
            description.type.constructor === Object
        );

        if ( isObjectDescription ) {
            const elementType = description.type.element;
            
            description.type = "object";
            description.element = elementType;
        }


        if ( description.type === "object" ) {
            // prepare element description
            description.element = Type.create( description.element || "*", key );
        }
    }

    public nullAsEmpty: boolean;
    public emptyAsNull: boolean;
    public element: any;

    constructor(params: IObjectTypeParams) {
        super(params);

        this.element = params.element;
        this.nullAsEmpty = params.nullAsEmpty;
        this.emptyAsNull = params.emptyAsNull;
    }

    public prepare(originalObject, modelKey) {
        if ( originalObject == null ) {
            if ( this.nullAsEmpty ) {
                const value = {};
                Object.freeze(value);
    
                return value;
            }
            return null;
        }
    
        const isObjectValue = (
            typeof originalObject === "object" &&
            !Array.isArray( originalObject ) &&
            !(originalObject instanceof RegExp)
        );
    
        if ( !isObjectValue ) {
            const valueAsString = invalidValuesAsString( originalObject );
    
            throw new Error(`invalid object for ${modelKey}: ${valueAsString}`);
        }
        
        const object = {};
        let isEmpty = true;
        const elementDescription = this.element;
        const elementTypeAsString = elementDescription.typeAsString();
    
        for (const key in originalObject) {
            let element = originalObject[ key ];
    
            try {
                element = elementDescription.prepare( element, key );
            } catch (err) {
                const valueAsString = invalidValuesAsString( originalObject );
    
                throw new Error(`invalid object[${ elementTypeAsString }] for ${modelKey}: ${valueAsString},${eol} ${err.message}`);
            }
    
            object[ key ] = element;
    
            isEmpty = false;
        }
    
        if ( this.emptyAsNull ) {
            if ( isEmpty ) {
                return null;
            }
        }
    
        Object.freeze( object );
    
        return object;
    }

    public toJSON(value) {
        const obj = value;
        const json = {};

        for (const key in obj) {
            const objValue = obj[ key ];
            json[ key ] = this.element.toJSON( objValue );
        }

        return json;
    }

    public clone(value) {
        const obj = value;
        const json = {};

        for (const key in obj) {
            const objValue = obj[ key ];
            json[ key ] = this.element.clone( objValue );
        }

        return json;
    }

    public equal(selfObj, otherObj, stack) {
        if ( selfObj == null ) {
            return otherObj === null;
        }

        if ( !isObject(otherObj) ) {
            return false;
        }

        for (const key in selfObj) {
            const selfValue = selfObj[ key ];
            const otherValue = otherObj[ key ];
            const isEqual = this.element.equal( selfValue, otherValue, stack );

            if ( !isEqual ) {
                return false;
            }
        }

        // check additional keys from otherObj
        for (const key in otherObj) {
            if ( key in selfObj) {
                continue;
            }

            // exists unknown property for selfObj
            return false;
        }

        return true;
    }
}

Type.registerType("object", ObjectType);

module.exports = ObjectType;
