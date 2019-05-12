"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection tests", () => {

    it("findIndex()", () => {

        class Colors extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let colors = new Colors([
            {name: "red"},
            {name: "green"},
            {name: "blue"}
        ]);

        let index = colors.findIndex(color =>
            color.get("name") == "green"
        );

        assert.strictEqual( index, 1 );
    });
    
    it("findIndex(f, context)", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.findIndex(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});