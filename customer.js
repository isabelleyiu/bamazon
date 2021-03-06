const Table = require('cli-table');
const inquirer = require('inquirer');

class Customer {
  getProducts(pool) {
    pool.query(`SELECT * FROM products WHERE stock_qty > 0 ORDER BY dept_name ASC`, (err, results) => {
      if(err) console.log('Something went wrong...');
      this.displayProductList(results.rows, pool);
    });
  }
  displayProductList(inventory, pool) {
    const table = new Table({
      head: ['Product Name', 'Department', 'Price']
    });

    inventory.map(item => {
      table.push([item.product_name, item.dept_name, item.price]);
    });

    // display table
    console.log('\n');
    console.log(table.toString());
    console.log('\n');

    this.selectItem(inventory, pool);
  }
  selectItem(inventory, pool){
    const questions = [
      {
        type: 'rawlist',
        name: 'product',
        choices: () => {
          return inventory.map(product => product.product_name);
        },
        message: 'Select a product'
      },
      {
        type: 'input',
        name: 'qty',
        message: 'How many would you like?',
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
        message: 'Would you like to purchase any other items(just hit enter for YES)?',
        default: true
      }
    ];
    
    const shoppingCart = [];

    const ask = () => {
      inquirer
      .prompt(questions)
        .then(answers => {
          const selectedProduct = inventory.filter(stock => stock.product_name === answers.product)[0];

          if(answers.qty <= selectedProduct.stock_qty) {
            selectedProduct.selectedQty = parseInt(answers.qty);
            shoppingCart.push(selectedProduct);
            console.log(`${answers.qty} units of ${answers.product} has been added to your shopping cart!`);
          } else {
            console.log(`We are sorry. We don't have enough ${answers.product} in stock to fulfill your order.\nPlease select a quantity smaller than ${selectedProduct.stock_qty} or purchase another item.`);
          }
          if(answers.askAgain) {
            ask();
          } else {
            this.checkOut(shoppingCart, pool);
          }
        })
    }
    ask();
  }
  checkOut(shoppingCart, pool) {
    const table = new Table({
      head: ['Product Name', 'Quantity', 'Price', 'total']
    });

    let grandTotal = 0;

    shoppingCart.forEach(item => {
      let itemTotal = item.price * item.selectedQty;
      grandTotal += itemTotal;

      table.push([item.product_name, item.selectedQty, item.price, itemTotal]);

      let newQty = item.stock_qty - item.selectedQty;
      pool.query(`UPDATE products SET stock_qty = $1 WHERE product_name = $2 RETURNING *`, 
        [newQty, item.product_name],  
        (err, results) => {
        if(err) console.log('Something went wrong...');
        // console.log(`For manager/supervisor's eyes only: ${item.product_name} quantity was ${item.stock_qty}, now is ${newQty}.`)
      });
    });

    console.log('\n');
    console.log(table.toString());
    console.log(`Your grand total is $${grandTotal}. Thank you for shopping with us today :)`)
    console.log('\n');
  }
}
          
module.exports = Customer;
