import duckdb from "duckdb";

export async function createTables(db) {
  db.exec(
    "CREATE TABLE users AS SELECT * FROM read_csv_auto('data/users.csv', header=True);"
  );
  db.exec(
    "CREATE TABLE useraccounts AS SELECT * FROM read_csv_auto('data/useraccounts.csv', header=True);"
  );
  db.exec(
    "CREATE TABLE periods AS SELECT * FROM read_csv_auto('data/periods.csv', header=True);"
  );
  db.exec(
    "CREATE TABLE praises AS SELECT * FROM read_csv_auto('data/praises.csv', header=True);"
  );
  db.exec(
    "CREATE TABLE quantifications AS SELECT * FROM read_csv_auto('data/quantifications.csv', header=True);"
  );
}

export async function initDuckDb() {
  const db = new duckdb.Database(":memory:"); // or a file name for a persistent DB
  createTables(db);

  const query = (sql) => {
    return new Promise((resolve, reject) => {
      db.all(sql, function (err, res) {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
  };
  return { query };
}
