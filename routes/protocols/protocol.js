const Sequelize = require('sequelize');

const sequelize = new Sequelize('codeforgeek', 'postgres', 'shahid', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 9,
    min: 0,
    idle: 10000
  }
});

sequelize.authenticate().then(() => {
  console.log("Success!");
}).catch((err) => {
  console.log(err);
});

/*
Connecting to the Database
Creating the model
Performing CRUD Operation
Monitoring Queries
*/

sequelize.authenticate().then(() => {
    console.log("Success!");
    var Posts = sequelize.define('posts', {
      title: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.STRING
      }
    }, {
      freezeTableName: true
    });
  
    Posts.sync({force: true}).then(function () {
      return Posts.create({
        title: 'Getting Started with PostgreSQL and Sequelize',
        content: 'Hello there'
      });
    });
  }).catch((err) => {
    console.log(err);
  });
//SELECT * FROM `posts` WHERE `id`=2019;

Posts.findAll({}).then((data) => {
    console.log(data);
 }).catch((err) => {
    console.log(err);
 });

 Posts.findAll({
    where: {
      id: '100'
    }
   }).then((data) => {
      console.log(data);
   }).catch((err) => {
      console.log(err);
   });

Posts.update({
    content: 'This is a tutorial to learn Sequelize and PostgreSQL'
  }, {
    where: {
      id: 1
    }
  }).then(() => {
    console.log('Updated');
  }).catch((e) => {
    console.log("Error"+e);
  });

  Posts.destroy({where: {
    id: 1
  }}).then(() => {
    console.log("Deleted");
  }).catch((e) => {
    console.log("Error"+e);
  });

  const { Sequelize } = require("sequelize");
  // with URI
const sequelize1 = new Sequelize(process.env.POSTGRESQL_DB_URI)
const testDbConnection = async () => {
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  };
  // example.js
const { sq } = require("../config/db");


const { DataTypes } = require("sequelize");


  const User = sq.define("user", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  
    fullName: {
      type: DataTypes.STRING,
    },
    
    age: {
      type: DataTypes.INTEGER,
    },
  
    employed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
  User.sync().then(() => {
    console.log("User Model synced");
  });

  const mike = User.create({
    email: "mike@example.com",
    fullName: "Mike Smith",
    age: 30,
    employed: true,
  });
  // Find all users
const users = await User.findAll();
User.findAll({
    where: {
      employed: true
    }
  });

  await User.update({ employed: true }, {
    where: {
      employed: false
    }
  });
  const userMike = await User.findOne({ where: { email: "mike@example.com" } });

if(userMike !== null) {
  userMike.email = "mike@example.org"
  await userMike.save()
}
await User.destroy({
    where: {
      email: "mike@example.org"
    }
  });