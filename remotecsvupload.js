const fs = require("fs");
const mysql = require("mysql");
const csv = require("fast-csv");

let myArgs = process.argv.slice(2);
if (myArgs.length < 2) {
  console.error(`Please provide $TABLE_NAME $INPUT_FILE`);
  process.exit(1);
}

let stream = fs.createReadStream(`./${myArgs[1]}`);
let resData = [];

let csvStream = csv
  .parse()
  .on("data", function (data) {
    resData.push(data);
  })
  .on("end", function () {
    resData.shift();

    const con = mysql.createConnection({
      host: "host",
      user: "user",
      password: "password",
      database: "database",
    });

    con.connect((error) => {
      if (error) {
        console.error(error);
      } else {
        var sql = `CREATE TABLE IF NOT EXISTS ${myArgs[0]} (id INT(3),first_name VARCHAR(255),last_name VARCHAR(255),email VARCHAR(255),gender VARCHAR(255),ip_address VARCHAR(255))`;
        con.query(sql, function (err, result) {
          console.log(err || result);
        });

        let query = `INSERT INTO ${myArgs[0]} (id, first_name, last_name, email, gender, ip_address) VALUES ?`;
        con.query(query, [resData], (error, response) => {
          console.log(error || response);
        });

        con.end();
      }
    });
  });

stream.pipe(csvStream);
