"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /** Create a job (from data), update db, return new job data.
    * 
    * data should be { title, salary, equity, companyHandle }
    * 
    * Returns { id, title, name, equity, companyHandle }
    * 
    
    */

  static async create({ title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(
      `SELECT title
                FROM jobs
                WHERE title = $1 AND company_handle = $2`,
      [title, companyHandle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(
        `Duplicate job: ${title} at company: ${companyHandle}`
      );

    const result = await db.query(
      `INSERT INTO jobs
          (title, salary, equity, company_handle)
          VALUES ($1, $2, $3, $4)
          RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    let job = result.rows[0];

    return job;
  }

  static async findAll(searchFilters = {}) {
    //creates the basic query string which we will build the rest of the query on
    let query = `SELECT 
                    id, 
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
                    FROM jobs`;
    //empty array to hold WHERE expressiona dhte associated values
    let whereExpressions = [];
    let queryValues = [];

    const { title, minSalary, hasEquity } = searchFilters;

    if (title !== undefined) {
      queryValues.push(title);
      whereExpressions.push(`title = $${queryValues.length}`);
    }

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity == true) {
      whereExpressions.push(`equity > 0`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY title";
    const jobsRes = await db.query(query, queryValues);
    return jobsRes.rows;
  }

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id, 
      title, 
      salary, 
      equity, 
      company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }
}

module.exports = Job;
