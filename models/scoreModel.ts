import { ResultSetHeader } from "mysql2";
import pool from "../config/database.js";

import { type ScoreEntry } from "../types.js";

//Function to intake a scoreentry and upload it into the database
//If a scoreentry already exists for the user, delete the old value and replace it with the new info
async function uploadScore(score: ScoreEntry): Promise<Boolean> {
    //Update information, assuming that the score already exists
    let [result] = await pool.query<ResultSetHeader>
        ("UPDATE Score SET score = ?, correctCount = ?, timeCompleted = ?, isPublic = ? " + 
            "WHERE userId = ? AND cityId = ? AND ? > score", 
        [score.score,score.correctCount,score.timeCompleted,score.isPublic,
            score.userId,score.cityId,score.score]);
    //If data was affected, we know that a score did exist and was update, return successfully
    if(result.affectedRows === 1){
        return true;
    }
    //Otherwise, check if a score does exist
    const [existing] = await pool.query<ScoreEntry[]>(
        "SELECT scoreId FROM Score WHERE userId = ? AND cityId = ?",
        [score.userId, score.cityId]
    );
    //If it does exist, return false since you aren't inserting
    if (existing.length > 0) {
        // row exists but new score isn't higher, don't insert
        return false;
    }
    //If it never existed, need to add data since this is the first quiz from that user
    [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO Score (userId, cityId, correctCount, score, timeCompleted, isPublic) VALUES (?, ?, ?, ?, ?, ?)",
        [score.userId, score.cityId, score.correctCount, score.score, score.timeCompleted, score.isPublic]
    );
    //Verify only 1 row was changed and report 
    return result.affectedRows === 1;
}


//Function to pull the top 10 scores of a user, no repeating cities
async function pullTop10OfUser(userId: number): Promise<ScoreEntry[]>{
    const rows = (await pool.query<ScoreEntry[]>("SELECT * " +
        "FROM Score WHERE userId = ? ORDER BY score DESC LIMIT 10",[userId]))[0];
    return(rows);
}

//Function to pull the top 10 scores of a city, no repeating users, overcomplicated but its fine
async function pullTop10OfCity(cityId: number): Promise<ScoreEntry[]>{
    const rows = (await pool.query<ScoreEntry[]>(
        "SELECT * FROM Score WHERE cityId = ? AND isPublic = true ORDER BY score DESC LIMIT 10", [cityId]))[0];
    return(rows);
}

//Function to get the personal best of a user given their id and cityid.
async function getPersonalBest(userId:number,cityId:number): Promise<ScoreEntry>{
    const [rows] = (await pool.query<ScoreEntry[]>(
        "SELECT * FROM Score WHERE userId = ? AND cityId = ?", [userId,cityId]
    ));
    return rows[0];
}

/* old pulltop10total where it pulls top 10 score rows not top 10 users
//Function to get the top 10 scores of all time for the homepage
async function pullTop10Total(): Promise<ScoreEntry[]>{
    const [rows] = (await pool.query<ScoreEntry[]>(
        "SELECT * FROM Score WHERE isPublic = TRUE ORDER By score DESC LIMIT 10"
    ));
    return rows;
}
*/

//Revised Function to get the top 10 users by total score for the homepage
async function pullTop10Total(): Promise<ScoreEntry[]>{
    const [rows] = await pool.query<ScoreEntry[]>(
        "SELECT MIN(scoreId) AS scoreId, userId, MIN(cityId) AS cityId, " +
        "SUM(correctCount) AS correctCount, SUM(score) AS score, " +
        "SUM(timeCompleted) AS timeCompleted, TRUE AS isPublic " +
        "FROM Score WHERE isPublic = TRUE " +
        "GROUP BY userId " +
        "ORDER BY score DESC LIMIT 10"
    );
    return rows;
}


export {
    uploadScore,
    pullTop10OfUser,
    pullTop10OfCity,
    getPersonalBest,
    pullTop10Total
}