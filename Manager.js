const Table = require('cli-table');
const inquirer = require('inquirer');

class Manager {
  login(pool) {
    inquirer
      .prompt([
        {
          type: 'password',
          message: 'Enter a masked password',
          name: 'password',
          mask: '*',
          validate: value => {
            if (/\w/.test(value) && /\d/.test(value)) {
              return true;
            }
            return 'Password need to have at least a letter and a number';
          }          
        }
      ])
        .then(answers => {
          if(answers.password) {
            this.getInventory(pool);
            console.log(`You're successfully login as manager.`);
          } else {
            console.log('Goodbye');
          }
        });
  }
  getInventory(pool) {
    pool.query(`SELECT * FROM products ORDER BY stock_qty ASC`, (err, results) => {
      if(err) console.log('Something went wrong...');
      this.displayOptions(results.rows, pool);
    });
  }
  displayOptions(inventory, pool) {
    inquirer
      .prompt({
        type: 'rawlist',
        name: 'action',
        choices: ['View Products For Sale', 'View Low Inventory', 'Restock Inventory', 'Add New Product', 'Log Out'],
        message: 'Select an action'
        })
        .then(answers => {
          if(answers.action === 'View Products For Sale') {
            this.displayInventory(inventory, pool);
          } else if(answers.action === 'View Low Inventory') {
            this.viewLowInventory(inventory, pool);
          } else if(answers.action === 'Restock Inventory') {
            this.restockInventory(inventory, pool);
          } else if(answers.action === 'Add New Product') {
            this.addNewProduct(inventory, pool);
          } else if(answers.action === 'Log Out') {
            console.log('Goodbye.')
          }
        });
  }
  displayInventory(inventory, pool) {
    const table = new Table({
      head: ['id', 'Product Name', 'Department', 'Price', 'Quantity']
    });

    inventory.map(item => {
      table.push([item.item_id, item.product_name, item.dept_name, item.price, item.stock_qty]);
    });

    // display table
    console.log('\n');
    console.log(table.toString());
    console.log('\n');

    this.viewLowInventory(inventory, pool);
  }
  viewLowInventory(inventory, pool) {
    const lowStock = inventory.filter(item => item.stock_qty <= 10);
    this.restockInventory(inventory, pool);
  }
  restockInventory(inventory, pool) {
    const questions = [
      {
        type: 'rawlist',
        name: 'product',
        choices: () => {
          return inventory.map(product => product.product_name);
        },
        message: 'Which product would you like to re-stock?'
      },
      {
        type: 'input',
        name: 'qty',
        message: 'How many are you adding to current stock?',
        validate: (input) => {
          if(/\d/.test(input)) {
            return true;
          }
          return 'Please enter a valid number';
        }
      },
      {
        type: 'confirm',
        name: 'askAgain',
        message: 'Would you like to re-stock any other items(just hit enter for YES)?',
        default: true
      }
    ];
    const ask = () => {
      inquirer
      .prompt(questions)
        .then(answers => {

          const selectedItem = inventory.filter(item => item.product_name === answers.product)[0];

          let newQty = selectedItem.stock_qty + parseInt(answers.qty);

          pool.query(`UPDATE products SET stock_qty = $1 WHERE product_name = $2 RETURNING *`, 
            [newQty, selectedItem.product_name], 
            (err, results) => {
              if(err) console.log('Something went wrong...');
              console.log(`${selectedItem.product_name}'s stock quantity has been changed from ${selectedItem.stock_qty} to ${newQty}`);
            });
          if(answers.askAgain) {
            ask();
          } else {
            this.displayOptions(inventory, pool);
          }
        });
    }
    ask();
  }
  addNewProduct(inventory, pool) {
    const questions = [
      {
        type: 'input',
        name: 'product',
        message: 'What is the name of the new product?'
      },
      {
        type: 'input',
        name: 'department',
        message: 'Which department should it go into?'
      },
      {
        type: 'input',
        name: 'price',
        message: 'How much is the retail price?',
        validate: (input) => {
          if(/\d/.test(input)) {
            return true;
          }
          return 'Please enter a valid number';
        }
      },
      {
        type: 'input',
        name: 'qty',
        message: 'How many are you adding to current stock?',
        validate: (input) => {
          if(/\d/.test(input)) {
            return true;
          }
          return 'Please enter a valid number';
        }
      }
    ];
    inquirer
      .prompt(questions)
        .then(answers => {
          pool.query(`INSERT INTO products (product_name, dept_name, price, stock_qty)
          VALUES($1, $2, $3, $4) RETURNING *;`, 
            [answers.product, answers.department, answers.price, answers.qty], 
            (err, results) => {
              if(err) {
                console.log('Something went wrong...');
              } else {
                this.displayInventory(results.rows);
                console.log(`${answers.qty} units of ${answers.product} has been added to ${answers.department} for $${answers.price} each`);
              }
            });
        });
  }
}

module.exports = Manager;