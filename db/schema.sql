CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  season INT,
  episode_number INT,
  air_date DATE
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE episode_subjects (
  id SERIAL PRIMARY KEY,
  episode_id INT REFERENCES episodes(id),
  subject_id INT REFERENCES subjects(id)
);

CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  hex_code VARCHAR(7)
);

CREATE TABLE episode_colors (
  id SERIAL PRIMARY KEY,
  episode_id INT REFERENCES episodes(id),
  color_id INT REFERENCES colors(id)
);
