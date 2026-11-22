create database if not exists clubu_db;
use clubu_db;
create table if not exists events (
    event_id int primary key auto_increment,
    description varchar(200) not null,
    category varchar(100) not null,
    unit varchar(20) default 'Seats',
    seats int not null,
    price decimal(10, 2) not null,
    info text
);
create table if not exists reservations (
    reservation_id int primary key auto_increment,
    event_id int not null,
    customer_name varchar(255) not null,
    customer_email varchar(255) not null,
    total decimal(10, 2) not null,
    quantity int not null default 1,
    foreign key (event_id) references events(event_id)
);
create table if not exists finalizations (
    finalization_id int primary key auto_increment,
    reservation_id int not null,
    attendance_type varchar(255) not null,
    payment_method varchar(255) not null,
    total decimal(10, 2) not null,
    finalization_date timestamp default current_timestamp,
    foreign key (reservation_id) references reservations(reservation_id)
);

