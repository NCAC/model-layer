"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model validate", () => {
    
    it("required field", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        required: true
                    },
                    age: "number"
                };
            }
        }

        try {
            new SomeModel();
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "required name");
        }


        let model = new SomeModel({
            name: "Andrew"
        });
        assert.equal( model.get("name"), "Andrew" );
        assert.equal( model.data.name, "Andrew" );

        model.set("age", 40);
        assert.strictEqual( model.get("age"), 40 );
        assert.strictEqual( model.data.age, 40 );

        try {
            model.set("name", null);
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "required name");
        }


        assert.equal( model.get("name"), "Andrew" );
        assert.equal( model.data.name, "Andrew" );
        assert.strictEqual( model.get("age"), 40 );
        assert.strictEqual( model.data.age, 40 );
    });

    it("validate method", () => {
        class AgeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 0
                    }
                };
            }

            validate(data) {
                if ( data.age < 0 ) {
                    throw new Error("invalid age");
                }
            }
        }

        // validate in constructor
        try {
            new AgeModel({
                age: -1
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid age");
        }


        let model = new AgeModel({
            age: 100
        });

        // validate in set
        try {
            model.set({
                age: -100
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid age");
        }

        // error in validate, returns previous state
        assert.equal( model.data.age, 100 );
    });

    it("cannot change state in validate method", () => {
        class AgeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 0
                    }
                };
            }

            validate(data) {
                data.age = 200;
            }
        }

        try {
            new AgeModel({ age: 1 });
            
            throw new Error("expected error");
        } catch(err) {
            assert.ok(
                /Cannot assign to read only property/.test(err.message)
            );
        }
    });

    it("this.data in validate is previous state", () => {
        class AgeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 100
                    }
                };
            }

            validate(data) {
                assert.equal( this.data.age, 100 );
                assert.equal( data.age, 200 );
            }
        }
        
        new AgeModel({
            age: 200
        });
    });

    it("validate field", () => {
        class AgeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 0,
                        validate: age =>
                            age >= 0
                    }
                };
            }
        }

        // validate in constructor
        try {
            new AgeModel({
                age: -1
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid age: -1");
        }


        let model = new AgeModel({
            age: 100
        });

        // validate in set
        try {
            model.set({
                age: -100
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid age: -100");
        }

        // error in validate, returns previous state
        assert.equal( model.data.age, 100 );
    });

    it("do not validate null value", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: {
                        type: "string",
                        validate: value => 
                            value === "nice"
                    }
                };
            }
        }

        let model;

        // safety create empty model
        new SomeModel();

        // safety set null
        model = new SomeModel({
            prop: "nice"
        });

        assert.strictEqual(model.data.prop, "nice");


        model.set("prop", null);
        assert.strictEqual(model.data.prop, null);
    });


    it("validate field by RegExp", () => {
        class WordModel extends Model {
            static structure() {
                return {
                    word: {
                        type: "string",
                        validate: /^\w+$/
                    }
                };
            }
        }

        // validate in constructor
        try {
            new WordModel({
                word: " some 12123 "
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid word: \" some 12123 \"");
        }


        let model = new WordModel({
            word: "test"
        });

        // validate in set
        try {
            model.set({
                word: "some wrong"
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid word: \"some wrong\"");
        }

        // error in validate, returns previous state
        assert.equal( model.data.word, "test" );
    });

    it("enum validate", () => {
        class EnumModel extends Model {
            static structure() {
                return {
                    color: {
                        type: "string",
                        enum: ["red", "green", "blue"]
                    }
                };
            }
        }

        let model = new EnumModel();
        assert.strictEqual( model.data.color, null );

        // validate in set
        try {
            model.set({
                color: "orange"
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid color: \"orange\"");
        }

        // error in validate, returns previous state
        assert.strictEqual( model.data.color, null );


        // validate in constructor
        try {
            new EnumModel({
                color: "dark blue"
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid color: \"dark blue\"");
        }
    });

    it("isValid(data)", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    sale: {
                        type: "number",
                        required: true
                    },
                    buy: {
                        type: "number",
                        required: true
                    },
                    color: {
                        type: "string",
                        enum: ["red", "green", "blue"]
                    },
                    word: {
                        type: "string",
                        validate: /^\w+$/
                    },
                    age: {
                        type: "number",
                        validate: age => 
                            age > 0
                    },
                    prop: "string"
                };
            }

            validate(data) {
                if ( data.buy > data.sale ) {
                    throw new Error("invalid sale");
                }
            }
        }

        let model = new SomeModel({
            buy: 10,
            sale: 30
        });

        // valid
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 200
        }), true);

        // ignore required error, because isValid we using before .set
        assert.strictEqual(model.isValid({}), true);
            
        // buy > sale
        assert.strictEqual(model.isValid({
            buy: 1000
        }), false);

        // enum validate
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 200,
            color: "pink"
        }), false);

        // regexp validate
        assert.strictEqual(model.isValid({
            buy: 1,
            sale: 10,
            word: "wrong word"
        }), false);

        // function validate for field
        assert.strictEqual(model.isValid({
            buy: 1,
            sale: 2,
            age: -1
        }), false);

        // unknown property
        assert.strictEqual(model.isValid({
            buy: 1,
            sale: 101,
            xx: true
        }), false);

        // custom validate data
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 20
        }), false);

    });

    it("const prop", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        const: true
                    }
                };
            }
        }

        let model = new SomeModel();

        assert.strictEqual( model.data.name, null );

        try {
            model.set("name", "new name");
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "cannot assign to read only property: name");
        }


        model = new SomeModel({
            name: "Bob"
        });
        assert.equal( model.data.name, "Bob" );

        try {
            model.set("name", "new name");
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "cannot assign to read only property: name");
        }
    });

    
});