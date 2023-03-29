const Sequelize = require('sequelize');
const feedTableModel = require('./model.js').feedTableModel;

const SEQ = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: 3306,
    dialect: 'mysql',
  },
);

async function main() {
  const FeedTable = feedTableModel(SEQ);
  await FeedTable.sync({ force: true });

  const rows = await FeedTable.findAll();
  rows.forEach((row) => {
    console.log(row);
  });
}
main();
