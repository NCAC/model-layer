"use strict";

const Type = require("./Type");
const Model = require("../Model");
const {isObject, isPlainObject, isNaN} = require("../utils");


class AnyType extends Type {
    toJSON(value) {
        return value2json( value );
    }

    equal(selfValue, otherValue, stack) {
        return equal(selfValue, otherValue, stack);
    }
}

function equal(selfValue, otherValue, stack) {
    if ( selfValue instanceof Date && otherValue instanceof Date ) {
        return +selfValue == +otherValue;
    }

    if ( selfValue instanceof RegExp && otherValue instanceof RegExp ) {
        return selfValue.toString() == otherValue.toString();
    }

    if ( Array.isArray(selfValue) && Array.isArray(otherValue) ) {
        if ( selfValue.length != otherValue.length ) {
            return false;
        }

        // stop circular recursion
        let stacked = stack.get(selfValue);
        if ( stacked ) {
            return stacked == otherValue;
        }
        stack.add(selfValue, otherValue);
        

        
        for (let i = 0, n = selfValue.length; i < n; i++) {
            let selfItem = selfValue[ i ];
            let otherItem = otherValue[ i ];

            let isEqualItem = equal( selfItem, otherItem, stack );
            if ( !isEqualItem ) {
                return false;
            }
        }
        
        return true;
    }

    if ( isPlainObject(selfValue) && isPlainObject(otherValue) ) {
        // stop circular recursion
        let stacked = stack.get(selfValue);
        if ( stacked ) {
            return true;
        }
        stack.add(selfValue, otherValue);

        let selfObj = selfValue;
        let otherObj = otherValue;

        for (let key in selfObj) {
            let selfValue = selfObj[ key ];
            let otherValue = otherObj[ key ];
            let isEqual = equal( selfValue, otherValue, stack );
            
            if ( !isEqual ) {
                return false;
            }
        }

        // check additional keys from otherObj
        for (let key in otherObj) {
            if ( key in selfObj) {
                continue;
            }

            // exists unknown property for selfObj
            return false;
        }

        return true;
    }

    if ( selfValue instanceof Model && otherValue instanceof Model ) {
        let stacked = stack.get(selfValue);
        if ( stacked ) {
            return true;
        }
        stack.add( selfValue, otherValue );

        return selfValue.equal( otherValue, stack );
    }

    if ( isNaN(selfValue) && isNaN(otherValue) ) {
        return true;
    }

    return selfValue === otherValue;
}

function value2json(value) {
    if ( value instanceof Date ) {
        return value.toISOString();
    }

    if ( value && typeof value.toJSON == "function" ) {
        return value.toJSON();
    }

    if ( Array.isArray(value) ) {
        return value.map(item =>
            value2json( item )
        );
    }

    if ( isObject(value) ) {
        let json = {};

        for (let key in value) {
            let item = value[ key ];

            json[ key ] = value2json( item );
        }

        return json;
    }

    return value;
}

Type.registerType("*", AnyType);

module.exports = AnyType;