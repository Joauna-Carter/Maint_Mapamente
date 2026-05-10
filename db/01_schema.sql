SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS mapamente CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mapamente;

CREATE TABLE City (
    cityId      INT AUTO_INCREMENT PRIMARY KEY,
    cityName    VARCHAR(100) NOT NULL UNIQUE,
    historyText TEXT NOT NULL,
    factsText   TEXT NOT NULL,
    cityBanner  VARCHAR(255) NOT NULL
);

CREATE TABLE User (
    userId       INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    profilePic   MEDIUMBLOB,
    isPublic     BOOLEAN      NOT NULL DEFAULT true,
    isAdmin      BOOLEAN      NOT NULL DEFAULT false,
    themeLight   BOOLEAN      NOT NULL DEFAULT true,
    isActive     BOOLEAN      NOT NULL DEFAULT true,
    -- deletedAt    TIMESTAMP    NULL     DEFAULT NULL
);

CREATE TABLE Question (
    questionId   INT AUTO_INCREMENT PRIMARY KEY,
    cityId       INT  NOT NULL,
    questionText TEXT NOT NULL,
    FOREIGN KEY (cityId) REFERENCES City(cityId)
);

CREATE TABLE Answer (
    answerId   INT AUTO_INCREMENT PRIMARY KEY,
    questionId INT          NOT NULL,
    answerText VARCHAR(255) NOT NULL,
    isCorrect  BOOLEAN      NOT NULL DEFAULT false,
    FOREIGN KEY (questionId) REFERENCES Question(questionId)
);

CREATE TABLE Score (
    scoreId      INT AUTO_INCREMENT PRIMARY KEY,
    userId       INT NOT NULL,
    cityId       INT NOT NULL,
    correctCount INT NOT NULL DEFAULT 0,
    score        INT NOT NULL,
    timeCompleted INT NOT NULL,
    isPublic     BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (cityId) REFERENCES City(cityId)
);
