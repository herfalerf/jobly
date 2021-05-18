const { BadRequestError } = require("../expressError");

const { sqlForPartialUpdate } = require("./sql");

dataToUpdate = { firstName: "John", lastName: "Doe", age: 30 };
jsToSql = { firstName: "first_name", lastName: "last_name", age: "age" };

describe("sqlForPartialUpdate", function () {
  test("converts json to pg arrays", function () {
    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(setCols).toEqual('"first_name"=$1, "last_name"=$2, "age"=$3');
    expect(values).toEqual(["John", "Doe", 30]);
  });
});
