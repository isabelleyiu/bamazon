// prompt user: Who are you? Customer, manager, and supervisor?
// For managers and supervisors, log unavailable at this time


const inquirer = require('inquirer');
const { Pool } = require('pg');
const Customer = require('./Customer');
const Manager = require('./Manager');

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
        const customer = new Customer;
        customer.getItems(pool);
      break;
      case 'Manager': 
        const manager = new Manager;
        manager.displayOptions(pool);
      break;
      case 'Supervisor': 
        console.log('Sorry Supervisor login unavailable.');
      break;
      default:
        console.log('Uh oh...Something went wrong');
        pool.end();
    }
  });

