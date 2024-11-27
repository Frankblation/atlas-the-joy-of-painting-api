-- Table for storing episodes
CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  season INT,
  episode_number INT,
  air_date DATE,
  description TEXT
);

-- Table for storing colors
CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  hex_value VARCHAR(7) NOT NULL
);

-- Join table for episodes and colors (many-to-many)
CREATE TABLE episode_colors (
  episode_id INT REFERENCES episodes(id),
  color_id INT REFERENCES colors(id),
  PRIMARY KEY (episode_id, color_id)
);

-- Table for storing subject matters
CREATE TABLE subject_matter (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Join table for episodes and subject matters (many-to-many)
CREATE TABLE episode_subjects (
  episode_id INT REFERENCES episodes(id),
  subject_id INT REFERENCES subject_matter(id),
  PRIMARY KEY (episode_id, subject_id)
);


CREATE TABLE paintings (
  painting_index INT PRIMARY KEY,
  img_src TEXT,
  painting_title TEXT,
  season TEXT,
  episode INT,
  num_colors INT,
  youtube_src TEXT,
  colors TEXT[],  -- Array of colors
  color_hex TEXT[],  -- Array of color hex codes
  Black_Gesso BOOLEAN,
  Bright_Red BOOLEAN,
  Burnt_Umber BOOLEAN,
  Cadmium_Yellow BOOLEAN,
  Dark_Sienna BOOLEAN,
  Indian_Red BOOLEAN,
  Indian_Yellow BOOLEAN,
  Liquid_Black BOOLEAN,
  Liquid_Clear BOOLEAN,
  Midnight_Black BOOLEAN,
  Phthalo_Blue BOOLEAN,
  Phthalo_Green BOOLEAN,
  Prussian_Blue BOOLEAN,
  Sap_Green BOOLEAN,
  Titanium_White BOOLEAN,
  Van_Dyke_Brown BOOLEAN,
  Yellow_Ochre BOOLEAN,
  Alizarin_Crimson BOOLEAN,
  episodeDate DATE,
  subjectMatter TEXT
);

