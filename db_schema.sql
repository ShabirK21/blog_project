-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- create a table to store admin details
CREATE TABLE
  IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  );

-- create a table to store all articles
CREATE TABLE
  IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    publication_date TEXT NOT NULL,
    last_modified TEXT NOT NULL,
    draft_or_published TEXT NOT NULL,
    likes INT DEFAULT 0,
    image_path TEXT
  );

CREATE TABLE
  IF NOT EXISTS userComments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles (id)
  );

INSERT INTO
  admins (username, password)
VALUES
  (
    'admin',
    '$2b$10$G/RO0saqJ6mUdDBThwc6K.MUF8eHn3BVamoxLjNSpWJAQfweZDBOe'
  );

INSERT INTO
  articles (
    title,
    content,
    author,
    publication_date,
    last_modified,
    draft_or_published,
    image_path
  )
VALUES
  (
    'testArticle',
    'testContent',
    'testAuthor',
    'testDate',
    'testDate',
    'draft',
    'testPath'
  );

COMMIT;
