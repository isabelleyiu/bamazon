const Table = require('cli-table');
const inquirer = require('inquirer');

class Manager {
  displayOptions(pool) {
    inquirer
      .prompt({
        type: 'rawlist',
        name: 'action',
        choices: ['View Products For Sale', 'View Low Inventory', 'Restock Inventory', 'Add New Product'],
        message: 'Select an action'
      })
      .then(answers => {
        if(answers.action === 'View Products For Sale') {
          this.getInventory(pool);
        }
      });
  }
  getInventory(pool) {
    pool.query(`SELECT * FROM products ORDER BY stock_qty ASC`, (err, results) => {
      if(err) console.log('Something went wrong...');
      this.displayInventory(results.rows);
    });
  }
  displayInventory(inventory) {
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
  }
}

module.exports = Manager;