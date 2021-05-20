"user stric";

const db = require("../db.js");

const { BadRequestError, NotFoundError } = require("../expressError");
const { findAll, update } = require("./company.js");
const Company = require("./company.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//**************************CREATE */
describe("create", function () {
  const newJob = {
    title: "new_job",
    salary: 50000,
    equity: "0.01",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      ...newJob,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE title = 'new_job'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new_job",
        salary: 50000,
        equity: "0.01",
        company_handle: "c1",
      },
    ]);

    expect(1).toEqual(expect.any(Number));
  });

  test("bad request request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

//**************************findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 60000,
        equity: "0.00",
        companyHandle: "c1",
      },
      {
        id: testJobIds[1],
        title: "j2",
        salary: 70000,
        equity: "0.01",
        companyHandle: "c2",
      },
      {
        id: testJobIds[2],
        title: "j3",
        salary: 80000,
        equity: "0.02",
        companyHandle: "c3",
      },
    ]);
  });
});

//************************get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "j1",
      salary: 60000,
      equity: "0.00",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

//*************************update */

describe("update", function () {
  let updateData = {
    title: "new",
    salary: 1,
    equity: "0.5",
  };

  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE title = 'new'`
    );
    expect(result.rows).toEqual([
      {
        id: testJobIds[0],
        title: "new",
        salary: 1,
        equity: "0.5",
        company_handle: "c1",
      },
    ]);
  });

  test("works: null fields", async function () {
    let updateDataSetNulls = {
      title: "new",
      salary: null,
      equity: null,
    };

    let job = await Job.update(testJobIds[0], updateDataSetNulls);
    expect(job).toEqual({
      id: testJobIds[0],
      ...updateDataSetNulls,
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
          FROM jobs
          WHERE title = 'new'`
    );
    expect(result.rows).toEqual([
      {
        id: testJobIds[0],
        title: "new",
        salary: null,
        equity: null,
        company_handle: "c1",
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

//*********************remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query("SELECT title FROM jobs WHERE title='j1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// CREATE TABLE jobs (
//     id SERIAL PRIMARY KEY,
//     title TEXT NOT NULL,
//     salary INTEGER CHECK (salary >= 0),
//     equity NUMERIC CHECK (equity <= 1.0),
//     company_handle VARCHAR(25) NOT NULL
//       REFERENCES companies ON DELETE CASCADE
//   );
