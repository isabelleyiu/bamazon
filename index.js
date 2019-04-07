// prompt user: Who are you? Customer, manager, and supervisor?
// For managers and supervisors, log unavailable at this time


const inquirer = require('inquirer');
const { Pool } = require('pg');
const Customer = require('./customer');

const pool = new Pool({
  uesr: 'postgres',
  host: 'localhost',
  database: 'bamazon',
  password: '',
  port: 5432
});


inquirer
  .prompt({
    type: 'list',
    name: 'userRole',
    message: 'Welcome, who are you?',
    choices: ['Customer', 'Manager', 'Supervisor']
  })
  .then(answers => {
    switch(answers.userRole) {
      case 'Customer': 
        let customer = new Customer;
        customer.getItems(pool);
      break;
      case 'Manager': 
        console.log('Sorry Manager login unavailable.');
      break;
      case 'Supervisor': 
        console.log('Sorry Supervisor login unavailable.');
      break;
      default:
        console.log('Uh oh...Something went wrong');
        pool.end();
    }
  });
