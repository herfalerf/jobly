const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

//This function accepts a javascript object consisting of the data that needs to be changed (dataToUpdate) as well as an object containing the javascript to sql key changes (jsToSql).  For example, if the dataToUpdate argument = {username: "test" age: 30} the jsToSql argument might look like {username: "user_name", age: "age"} or whatever the equivalent column names in the database are.  This function then returns an array with the format ['first_column' = $1, etc.] for use in a pg query.  It also returns an array of values that can be used in the same pg query along with the array of columns.
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
