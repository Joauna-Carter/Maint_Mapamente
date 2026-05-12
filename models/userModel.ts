import { ResultSetHeader } from "mysql2";
import pool from "../config/database.js";
import { UserEntry } from "../types.js";

// Creates a user from a username and a passwordHash
async function createUser(username: string, passwordHash: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO User (username, passwordHash) VALUES (?, ?)",
    [username, passwordHash]
  );
  return result.affectedRows === 1;
}

// Soft deletes a user by setting isActive to false. 
// Returns true if successful, false if the user doesn't exist or is already inactive

/* Original deleteuser

// Soft deletes a user by setting isActive to false. 
// Returns true if successful, false if the user doesn't exist or is already inactive
async function deleteUser(userID: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE User SET isActive = ? WHERE userId = ?",
    [false, userID]
  );
  return result.affectedRows === 1;
}


*/


//privates an user
async function privateUser(userID: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
    "UPDATE User SET isPublic = true WHERE userId = ? AND isPublic = false",
    [userID]
  );
  return result.affectedRows === 1;

}
//un privates an user
async function publicUser(userID: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
    "UPDATE User SET isPublic = false WHERE userId = ? AND isPublic = true",
    [userID]
  );
  return result.affectedRows === 1;

}




//New deleteUser after fixes
async function deleteUser(userID: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE User SET isActive = false WHERE userId = ? AND isActive = true",
    [userID]
  );
  return result.affectedRows === 1;
}


// Find a user from a username. Returns null if it doesn't exist
async function findUserByUsername(username: string): Promise<UserEntry | null> {
  const [rows] = await pool.query<UserEntry[]>(
    "SELECT * FROM User WHERE username = ?",
    [username]
  );
  return rows[0] ?? null;
}

// Find a user from a userId. Returns null if it doesn't exist
// Needed because express-session uses the userId
async function findUserById(userId: number): Promise<UserEntry | null> {
  const [rows] = await pool.query<UserEntry[]>(
    "SELECT * FROM User WHERE userId = ?",
    [userId]
  );
  return rows[0] ?? null;
}

// Set the profile picture
async function updateUserProfilePic(userId: number, picBuffer: Buffer): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE User SET profilePic = ? WHERE userId = ?",
    [picBuffer, userId]
  );
  return result.affectedRows === 1;
}

export {
  createUser,
  deleteUser,
  findUserByUsername,
  findUserById,
  updateUserProfilePic,
  privateUser,
  publicUser
}
