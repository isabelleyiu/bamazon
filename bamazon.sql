DROP DATABASE IF EXISTS bamazon;

createdb -U postgres bamazon

psql -U postgres bamazon


CREATE TABLE products(item_id serial PRIMARY KEY, product_name VARCHAR(150), dept_name VARCHAR(150), price INT, stock_qty INT);