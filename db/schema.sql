-- Drop the tables if they exist
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS paintings CASCADE;
DROP TABLE IF EXISTS painting_colors CASCADE;

-- Now, create the tables again
CREATE TABLE episodes (
    episode_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    air_date DATE,
    description TEXT
);

CREATE TABLE paintings (
    painting_id SERIAL PRIMARY KEY,
    painting_title TEXT NOT NULL,
    season INT,
    episode INT,
    num_colors INT,
    youtube_src TEXT,
    colors TEXT,
    color_hex TEXT,
    painting_index INT,
    img_src TEXT
);

CREATE TABLE painting_colors (
    painting_color_id SERIAL PRIMARY KEY,
    painting_id INT REFERENCES paintings(painting_id),
    color_name TEXT,
    color_hex TEXT
);