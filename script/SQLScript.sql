-- Create a database for the web novel
CREATE DATABASE web_novel;

-- Use the web_novel database
USE web_novel;

-- user and writer
CREATE TABLE users (
    user_id INT(255) PRIMARY KEY AUTO_INCREMENT NOT null ,
    user_name VARCHAR(255) NOT null,
    email varchar(255) NOT null,
    password varchar(50) not null

);

-- catogory 
CREATE TABLE catogorys(
    catogory_id INT(255) PRIMARY KEY AUTO_INCREMENT,
    catogory_name varchar(255) NOT null

);

CREATE TABLE tags (
  tag_id int PRIMARY KEY AUTO_INCREMENT,
  tag_name varchar(255) NOT null
);


CREATE TABLE novel (
    novel_id INT PRIMARY KEY AUTO_INCREMENT,
    novel_name VARCHAR(255) NOT NULL,
    novel_type_id INT, 
    novel_type_name VARCHAR(255) NOT NULL,
    author_id INT, 
    author_name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    tag_id INT,
    tag_name VARCHAR(255),
    FOREIGN KEY (novel_type_id) REFERENCES catogorys(catogory_id),
    FOREIGN KEY (author_id) REFERENCES users(user_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);


-- Create a table to store information about the chapters
CREATE TABLE chapters (
  chapter_id INT PRIMARY KEY AUTO_INCREMENT,
  novel_id int ,
  title VARCHAR(255),
  content TEXT,
  published_date DATE,
  FOREIGN KEY (novel_id) REFERENCES novel(novel_id)
);

-- Create a table to store information about the reviews
CREATE TABLE comment (
  comment_id INT PRIMARY KEY AUTO_INCREMENT,
  rating INT,
  comment TEXT,
  chapter_id INT,
  FOREIGN KEY (chapter_id) REFERENCES chapters(chapter_id)
);

-- Create a table to store information about the bookmarks
CREATE TABLE bookmarks (
  bookmark_id INT PRIMARY KEY AUTO_INCREMENT,
  chapter_id INT,
  user_id INT,
  FOREIGN KEY (chapter_id) REFERENCES chapters(chapter_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create a table to store information about the likes
-- Create a table to store information about the likes
CREATE TABLE likes (
  like_id INT PRIMARY KEY AUTO_INCREMENT,
  chapter_id INT,
  user_id INT,
  FOREIGN KEY (chapter_id) REFERENCES chapters(chapter_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
