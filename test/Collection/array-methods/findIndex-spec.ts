

import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.findIndex", () => {

    it("findIndex()", () => {
        class Color extends Model<Color> {
            structure() {
                return {
                    name: Types.String,
                    price: Types.Number
                };
            }
        }

        class Colors extends Collection<Colors> {
            Model() {
                return Color;
            }
        }

        const colors = new Colors([
            {name: "red"},
            {name: "green"},
            {name: "blue"}
        ]);

        const index = colors.findIndex((color) =>
            color.get("name") === "green"
        );

        assert.strictEqual( index, 1 );
    });
    
    it("findIndex(f, context)", () => {
        class Product extends Model<Product> {
            structure() {
                return {
                    name: Types.String,
                    price: Types.Number
                };
            }
        }

        class Products extends Collection<Products> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        const context = {
            changed: false
        };

        products.findIndex(function() {
            this.changed = true;
            return true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});
