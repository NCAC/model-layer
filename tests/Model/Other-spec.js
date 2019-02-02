"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model other tests", () => {
    
    it("create model with data", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let data = {
            prop: "nice"
        };
        let model = new SomeModel(data);

        assert.strictEqual( model.get("prop"), "nice" );
        assert.strictEqual( model.data.prop, "nice" );

        assert.ok( model.data != data );
    });

    it("create model without data", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.data.prop, null );
    });

    it("model without structure", () => {
        
        class SomeModel extends Model {}

        try {
            new SomeModel();
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "static SomeModel.structure() is not declared");
        }

    });

    it("default value", () => {
        let model;
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: {
                        type: "string",
                        default: "default"
                    }
                };
            }
        }

        model = new SomeModel();
        assert.equal( model.get("prop"), "default" );
        assert.equal( model.data.prop, "default" );

        model = new SomeModel({});
        assert.equal( model.get("prop"), "default" );
        assert.equal( model.data.prop, "default" );

        model = new SomeModel({});
        assert.equal( model.get("prop"), "default" );
        assert.equal( model.data.prop, "default" );

        model = new SomeModel({
            prop: null
        });
        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.data.prop, null );


        model = new SomeModel({
            prop: undefined
        });
        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.data.prop, null );
    });

    it("default() value", () => {
        let now = Date.now();

        class SomeModel extends Model {
            static structure() {
                return {
                    now: {
                        type: "number",
                        default: () => Date.now()
                    }
                };
            }
        }

        let model = new SomeModel();

        assert.ok(
            model.data.now >= now
        );
    });

    it("set value", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    age: "number"
                };
            }
        }

        let model = new SomeModel();
        let data = model.data;

        assert.strictEqual( model.get("name"), null );
        assert.strictEqual( model.data.name, null );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );
        
        model.set("name", "nice");
        assert.equal( model.get("name"), "nice" );
        assert.equal( model.data.name, "nice" );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );
        
        assert.ok( data != model.data );
        data = model.data;

        model.set("name", null);
        assert.strictEqual( model.get("name"), null );
        assert.strictEqual( model.data.name, null );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );

        assert.ok( data != model.data );
        data = model.data;

        model.set({name: "test"});
        assert.equal( model.get("name"), "test" );
        assert.equal( model.data.name, "test" );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );

        assert.ok( data != model.data );
        data = model.data;

        model.set("age", 101);
        assert.equal( model.get("name"), "test" );
        assert.equal( model.data.name, "test" );
        assert.strictEqual( model.get("age"), 101 );
        assert.strictEqual( model.data.age, 101 );


        model.set({
            name: "Good",
            age: 99
        });
        assert.equal( model.get("name"), "Good" );
        assert.equal( model.data.name, "Good" );
        assert.strictEqual( model.get("age"), 99 );
        assert.strictEqual( model.data.age, 99 );
    });

    it("error on set unknown property", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        model.set("prop", "x");
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );
        
        let data = model.data;

        try {
            model.set("some", "1");
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "unknown property some");
        }

        // invalid action cannot change object
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );

        assert.ok( model.data === data );


        try {
            new SomeModel({
                some: "x"
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "unknown property some");
        }
    });


    it("model.data is freeze object", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        try {
            model.data.prop = "a";
            
            throw new Error("expected error");
        } catch(err) {
            assert.ok(
                /Cannot assign to read only property/.test(err.message)
            );
        }

        model.set("prop", "x");
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );

        try {
            model.data.prop = "y";
            
            throw new Error("expected error");
        } catch(err) {
            assert.ok(
                /Cannot assign to read only property/.test(err.message)
            );
        }

        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );
    });

    it("keep data if hasn't changes", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel({
            prop: "value"
        });

        let data = model.data;

        model.set("prop", "value");
        assert.ok( model.data == data );

        model.set({
            prop: "value"
        });
        assert.ok( model.data == data );
    });

    it("model.hasProperty", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        assert.strictEqual(
            model.hasProperty("prop"),
            true
        );

        assert.strictEqual(
            model.hasProperty("unknown"),
            false
        );
    });

    it("model.hasValue", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    age: "number"
                };
            }
        }

        let model = new SomeModel({
            name: "Bob"
        });

        assert.strictEqual(
            model.hasValue("name"),
            true
        );

        assert.strictEqual(
            model.hasValue("age"),
            false
        );

        model.set({
            name: null,
            age: 100
        });

        assert.strictEqual(
            model.hasValue("name"),
            false
        );

        assert.strictEqual(
            model.hasValue("age"),
            true
        );


        // unknown prop
        assert.strictEqual(
            model.hasValue("prop"),
            false
        );
    });

    it("model.toJSON", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    age: "number"
                };
            }
        }

        let model = new SomeModel();

        assert.deepEqual(
            model.toJSON(),
            {
                name: null,
                age: null
            }
        );

        model.set({
            name: "",
            age: 0
        });

        assert.deepEqual(
            model.toJSON(),
            {
                name: "",
                age: 0
            }
        );
    });

});