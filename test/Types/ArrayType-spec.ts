
import {Model, Types} from "../../lib/index";
import assert from "assert";
import {eol} from "../../lib/utils";
import { ISimpleObject } from "../../lib/Model";
import { Type } from "../../lib/type/Type";

describe("ArrayType", () => {
    
    it("array of numbers", () => {

        class CompanyModel extends Model<CompanyModel> {
            structure() {
                return {
                    name: Types.String,
                    managersIds: Types.Array({
                        element: Types.Number
                    })
                };
            }
        }

        const AnyCompany = CompanyModel as any;

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: false
                });
            }, 
            (err) => 
                err.message === "invalid array[number] for managersIds: false"
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: true
                });
            }, 
            (err) => 
                err.message ===  "invalid array[number] for managersIds: true"
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: {}
                });
            }, 
            (err) => 
                err.message === "invalid array[number] for managersIds: {}"
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: "1,2"
                });
            }, 
            (err) => 
                err.message === "invalid array[number] for managersIds: \"1,2\""
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: NaN
                });
            }, 
            (err) => 
                err.message === "invalid array[number] for managersIds: NaN"
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: /x/
                });
            }, 
            (err) => 
                err.message === "invalid array[number] for managersIds: /x/"
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: Infinity
                });
            }, 
            (err) => 
                err.message === "invalid array[number] for managersIds: Infinity"
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: -Infinity
                });
            }, 
            (err) =>
                err.message === "invalid array[number] for managersIds: -Infinity"
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: 0
                });
            }, 
            (err) => 
                err.message === "invalid array[number] for managersIds: 0"
        );
        


        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: [false]
                });
            }, 
            (err) => 
                err.message === `invalid array[number] for managersIds: [false],${eol} invalid number for 0: false`
        );
        

        assert.throws(
            () => {
                const company = new AnyCompany({
                    managersIds: ["1", "wrong"]
                });
            }, 
            (err) => 
                err.message === `invalid array[number] for managersIds: ["1","wrong"],${eol} invalid number for 1: "wrong"`
        );
        


        const outsideArr = ["1", 2] as number[];
        const companyModel = new CompanyModel({
            managersIds: outsideArr
        });

        const managersIds = companyModel.get("managersIds");

        assert.deepEqual( managersIds, [1, 2] );
        assert.strictEqual( managersIds[0], 1 );

        assert.ok( outsideArr !== managersIds );


        // array should be frozen
        assert.throws(
            () => {
                managersIds[0] = 10;
            },
            (err) =>
                /Cannot assign to read only property/.test(err.message)
        );
        

        assert.strictEqual( managersIds[0], 1 );
    });

    
    it("emptyAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    colors: Types.Array({
                        element: Types.String,
                        default: [],
                        emptyAsNull: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.colors, null );

        model.set({colors: ["red"]});
        assert.deepEqual( model.data.colors, ["red"] );

        model.set({colors: []});
        assert.strictEqual( model.data.colors, null );
    });

    it("nullAsEmpty", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    colors: Types.Array({
                        element: Types.String,
                        nullAsEmpty: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.deepEqual( model.data.colors, [] );

        model.set({colors: ["red"]});
        assert.deepEqual( model.data.colors, ["red"] );

        model.set({colors: null});
        assert.deepEqual( model.data.colors, [] );
    });


    it("array[boolean]", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    answers: Types.Array({
                        element: Types.Boolean
                    })
                };
            }
        }
        const AnyModel = SomeModel as any;

        assert.throws(
            () => {
                const anyModel = new AnyModel({
                    answers: [1, 0, false, true, "wrong"]
                });
            }, 
            (err) => 
                err.message === `invalid array[boolean] for answers: [1,0,false,true,"wrong"],${eol} invalid boolean for 4: "wrong"`
        );
        
        const someAnswers = [1, true] as boolean[];
        const model = new SomeModel({
            answers: someAnswers
        });

        const answers = model.data.answers;
        assert.deepEqual( answers, [true, true] );

        assert.strictEqual( answers[0], true );
        assert.strictEqual( answers[1], true );
    });

    it("array[date]", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    pays: Types.Array({
                        element: Types.Date
                    })
                };
            }
        }

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const someModel = new AnyModel({
                    pays: ["wrong"]
                });
            }, 
            (err) => 
                err.message === `invalid array[date] for pays: ["wrong"],${eol} invalid date for 0: "wrong"`
        );
        

        const now = Date.now();
        const model = new SomeModel({
            pays: [now]
        });

        const pays = model.data.pays;

        assert.strictEqual( +pays[0], now );
        assert.ok( pays[0] instanceof Date );
    });

    it("array[ChildModel]", () => {

        class UserModel extends Model<UserModel> {
            structure() {
                return {
                    name: Types.String({
                        trim: true
                    })
                };
            }
        }

        class CompanyModel extends Model<CompanyModel> {
            structure() {
                return {
                    managers: Types.Array({
                        element: UserModel
                    })
                };
            }
        }

        assert.throws(
            () => {
                const AnyModel = CompanyModel as any;
                const model = new AnyModel({
                    managers: [false]
                });
            }, 
            (err) => 
                err.message === `invalid array[UserModel] for managers: [false],${eol} invalid UserModel for 0: false`
        );
        

        const companyModel = new CompanyModel({
            managers: [{
                name: " Bob "
            }]
        });

        const managers = companyModel.data.managers as UserModel[];
        assert.ok( managers[0] instanceof UserModel );
        assert.equal( managers[0].get("name"), "Bob" );
    });

    it("array[string]", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    colors: Types.Array({
                        element: Types.String({
                            upper: true
                        })
                    }),
                    names: Types.Array({
                        element: Types.String({
                            trim: true
                        })
                    })
                };
            }
        }

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const someModel = new AnyModel({
                    names: [false]
                });
            }, 
            (err) => 
                err.message === `invalid array[string] for names: [false],${eol} invalid string for 0: false`
        );
        

        const model = new SomeModel({
            colors: ["red"],
            names: [" Bob "]
        });

        assert.deepEqual(model.data, {
            colors: ["RED"],
            names: ["Bob"]
        });
    });

    it("array[object]", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    users: Types.Array({
                        element: Types.Object({
                            element: Types.Any
                        })
                    })
                };
            }
        }

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const someModel = new AnyModel({
                    users: [{id: 1}, false]
                });
            }, 
            (err) => 
                err.message === `invalid array[object] for users: [{"id":1},false],${eol} invalid object for 1: false`
        );
        

        const model = new SomeModel({
            users: [{id: 1}]
        });

        const users = model.data.users;
        assert.deepEqual( users, [{id: 1}] );
    });

    it("unique primitive", () => {
        

        class CompanyModel extends Model<CompanyModel> {
            structure() {
                return {
                    managersIds: Types.Array({
                        element: Types.Number,
                        unique: true
                    })
                };
            }
        }

        assert.throws(
            () => {
                const someCompany = new CompanyModel({
                    managersIds: [1, 2, 1]
                });
            }, 
            (err) => 
                err.message === "managersIds is not unique: [1,2,1]"
        );
        

        const companyModel = new CompanyModel({
            managersIds: [1, 2]
        });

        assert.throws(
            () => {
                companyModel.set({managersIds: [2, 2]});

            
        
            }, 
            (err) => 
                err.message === "managersIds is not unique: [2,2]"
        );
        

        assert.deepEqual(companyModel.data.managersIds, [1, 2]);
        
        // in unique validation   null != null
        companyModel.set({managersIds: [null, undefined, null]});
        assert.deepEqual(companyModel.data.managersIds, [null, null, null]);
    });

    it("unique ChildModel", () => {

        class UserModel extends Model<UserModel> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class CompanyModel extends Model<CompanyModel> {
            structure() {
                return {
                    managers: Types.Array({
                        element: UserModel,
                        unique: true
                    })
                };
            }
        }

        const userModel1 = new UserModel({
            name: "test"
        });

        assert.throws(
            () => {
                const someCompany = new CompanyModel({
                    managers: [userModel1, userModel1]
                });
            }, 
            (err) => 
                err.message === "managers is not unique: [{\"name\":\"test\"},{\"name\":\"test\"}]"
        );
        

        const userModel2 = new UserModel({
            name: "test"
        }); 

        const companyModel = new CompanyModel({
            managers: [userModel1, userModel2]
        });

        let managers = companyModel.data.managers;
        assert.ok( managers[0] === userModel1 );
        assert.ok( managers[1] === userModel2 );

        assert.throws(
            () => {
                companyModel.set({managers: [userModel2, userModel2]});
            }, 
            (err) => 
                err.message === "managers is not unique: [{\"name\":\"test\"},{\"name\":\"test\"}]"
        );
        

        managers = companyModel.data.managers;
        assert.ok( managers[0] === userModel1 );
        assert.ok( managers[1] === userModel2 );
    });

    it("sort", () => {

        class CompanyModel extends Model<CompanyModel> {
            structure() {
                return {
                    managersIds: Types.Array({
                        element: Types.Number,
                        sort: true
                    })
                };
            }
        }

        const companyModel = new CompanyModel({
            managersIds: ["30" as any, 2, -10]
        });

        assert.deepEqual(companyModel.data.managersIds, [-10, 2, 30]);
    });

    it("sort by custom comparator", () => {

        interface ISomeData {
            names: string[];
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    names: Types.Array({
                        element: Types.String,
                        // sort by second letter
                        sort: (a, b) =>
                            +a[1] > +b[1] ?
                                1 :
                                -1
                    })
                };
            }
        }

        const model = new SomeModel({
            names: ["a3", "d4", "b2", "c1"]
        });

        assert.deepEqual(model.data.names, ["c1", "b2", "a3", "d4"]);
    });

    it("matrix", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    matrix: Types.Array({
                        element: Types.Array({
                            element: Types.Number
                        })
                    })
                };
            }
        }

        const model = new SomeModel({
            matrix: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]
        });

        assert.deepEqual(model.data.matrix, [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);
    });

    
    it("model.toJSON with array of models", () => {

        class TaskModel extends Model<TaskModel> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }


        class UserModel extends Model<UserModel> {
            structure() {
                return {
                    name: Types.String,
                    tasks: Types.Array({
                        element: TaskModel
                    })
                };
            }
        }

        const userModel = new UserModel({
            name: "Jack",
            tasks: [
                {name: "task 1"},
                {name: "task 2"}
            ]
        });

        assert.deepEqual(
            userModel.toJSON(),
            {
                name: "Jack",
                tasks: [
                    {name: "task 1"},
                    {name: "task 2"}
                ]
            }
        );
    });

    it("model.clone with array", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    ids: Types.Array({
                        element: Types.Number
                    })
                };
            }
        }

        const model = new SomeModel({
            ids: [1, 2, 3]
        });

        assert.deepEqual(model.data, {
            ids: [1, 2, 3]
        });

        const clone = model.clone();

        assert.ok( clone instanceof SomeModel );
        assert.ok( clone !== model );
        assert.ok( clone.data.ids !== model.data.ids );

        assert.deepEqual(clone.data, {
            ids: [1, 2, 3]
        });

        // change clone model
        clone.set({
            ids: [3, 4]
        });

        assert.deepEqual(model.data, {
            ids: [1, 2, 3]
        });

        assert.deepEqual(clone.data, {
            ids: [3, 4]
        });

        // change original model
        model.set({
            ids: [8]
        });

        assert.deepEqual(model.data, {
            ids: [8]
        });

        assert.deepEqual(clone.data, {
            ids: [3, 4]
        });
    });

    it("test base validate as prior validation", () => {
        const testArr1 = [1];
        const testArr2 = [2];


        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    ids: Types.Array({
                        element: Types.Number,
                        unique: true,
                        enum: [testArr1, testArr2]
                    })
                };
            }
        }

        assert.throws(
            () => {
                const someModel = new SomeModel({
                    ids: [3, 3]
                });
            }, 
            (err) => 
                err.message ===  "invalid ids: [3,3]"
        );
        
    });

    it("test array of any values", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    arr: Types.Array
                };
            }
        }

        const model = new SomeModel({
            arr: [1, "nice"]
        });

        assert.deepEqual(model.data, {
            arr: [1, "nice"]
        });
    });

    it("equal arrays", () => {
        const pairs: any[][] = [
            [null, null, true],
            [null, [], false],
            [[], [], true],
            [[1, 2], [1, 2], true],
            [[2, 1], [1, 2], false],
            [[1], [1, 2], false]
        ];

        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        arr: Types.Array({
                            element: Types.Number
                        })
                    };
                }
            }

            const model1 = new TestModel({
                arr: pair[0]
            });

            const model2 = new TestModel({
                arr: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                pair.toString()
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                pair.toString()
            );
        });
    });

    it("equal circular arrays", () => {
        const circular1 = [];
        circular1[0] = circular1;

        const circular2 = [];
        circular2[0] = circular2;

        const circular3 = [];
        circular3[0] = circular3;
        circular3[1] = [];

        const circular4 = [circular2, circular2];

        const pairs: any[][] = [
            [circular1, circular1, true],
            [circular1, circular2, true],
            [circular2, circular2, true],
            [circular1, circular3, false],
            [circular2, circular3, false],
            [circular2, circular4, false],
            [circular4, circular4, true]
        ];


        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        arr: Types.Array({
                            element: Types.Array
                        })
                    };
                }
            }

            const model1 = new TestModel({
                arr: pair[0]
            });

            const model2 = new TestModel({
                arr: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                pair.toString()
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                pair.toString()
            );
        });
    });

    
    // when in type defined BaseModel, and in data we have ChildModel (extends BaseModel), 
    // then clone should be instance of ChildModel
    it("clone array of models, should return array of instance of Child", () => {

        class FirstLevel extends Model<FirstLevel> {}

        class SecondLevel extends FirstLevel {
            structure() {
                return {
                    level: Types.Number({
                        default: 2
                    })
                };
            }
        }


        class MainModel extends Model<MainModel> {
            structure() {
                return {
                    arr: Types.Array({
                        element: FirstLevel
                    })
                };
            }
        }

        const second = new SecondLevel();
        const main = new MainModel({
            arr: [second]
        });

        assert.deepEqual(
            main.toJSON(),
            {
                arr: [{
                    level: 2
                }]
            }
        );

        const clone = main.clone();

        assert.ok( clone.get("arr")[0] instanceof SecondLevel );

    });


    it("conflicting parameters: nullAsZero and zeroAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    arr: Types.Array({
                        element: Types.Number,
                        emptyAsNull: true,
                        nullAsEmpty: true
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "arr: conflicting parameters: use only nullAsEmpty or only emptyAsNull"
        );
    });

});
