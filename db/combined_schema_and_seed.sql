-- Create 'paintings' table
CREATE TABLE Paintings (
    paintingId SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    airDate DATE,
    description TEXT
);

-- Create 'episodes' table
CREATE TABLE Episodes (
    episodeId SERIAL PRIMARY KEY,
    paintingId INT NOT NULL,
    episodeTitle VARCHAR(255) NOT NULL,
    episodeNumber INT NOT NULL,
    season INT NOT NULL,
    youtubeUrl TEXT,
    FOREIGN KEY (paintingId) REFERENCES Paintings (paintingId)
);

-- Create 'colors' table
CREATE TABLE Colors (
    colorId SERIAL PRIMARY KEY,
    paintingId INT NOT NULL,
    colorHex CHAR(7) NOT NULL,
    colorName VARCHAR(50),
    FOREIGN KEY (paintingId) REFERENCES Paintings (paintingId)
);

-- Create 'features' table
CREATE TABLE Features (
    featureId SERIAL PRIMARY KEY,
    featureName TEXT NOT NULL UNIQUE
);

-- Create 'painting_features' table
CREATE TABLE PaintingFeatures (
    paintingId INT NOT NULL,
    featureId INT NOT NULL,
    value BOOLEAN NOT NULL,
    FOREIGN KEY (paintingId) REFERENCES Paintings (paintingId),
    FOREIGN KEY (featureId) REFERENCES Features (featureId),
    PRIMARY KEY (paintingId, featureId)
);

-- Insert sample data into Paintings table
INSERT INTO Paintings (title, airDate, description) 
VALUES
('A Walk in the Woods', '1983-01-11', 'A scenic walk through the forest'),
('Mount McKinley', '1983-01-11', 'A painting capturing the beauty of Mt. McKinley');

-- Insert sample data into Episodes table
INSERT INTO Episodes (paintingId, episodeTitle, episodeNumber, season, youtubeUrl) 
VALUES
(1, 'A Walk in the Woods', 1, 1, 'https://www.youtube.com/watch?v=oh5p5f5-7a'),
(2, 'Mount McKinley', 2, 1, 'https://www.youtube.com/watch?v=uozir7povco');

-- Insert sample data into Colors table
INSERT INTO Colors (paintingId, colorHex, colorName) 
VALUES
(1, '#4e1500', 'Dark Red'),
(1, '#db0000', 'Bright Red');
