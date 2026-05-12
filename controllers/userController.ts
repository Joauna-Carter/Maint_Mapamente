import { Request, Response } from "express";
import "../types.js";
import bcrypt from "bcrypt";
import multer from "multer";
import sharp from "sharp";
import { privateUser, publicUser, createUser, deleteUser, findUserByUsername, findUserById, updateUserProfilePic } from "../models/userModel.js";
import { getTop10OfUser } from "./scoreController.js";

// Keep uploaded file in memory as a Buffer rather than writing to disk
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const SALT_ROUNDS = 12;

async function signupPost(req: Request, res: Response): Promise<void> {
  if (req.session.userId) {
    res.redirect("/profile");
    return;
  }
  const { username, password, passwordCheck } = req.body;

  if (!username || !password || !passwordCheck) {
    res.render('signup', { error: "All fields are required." });
    return;
  }

  if (password !== passwordCheck) {
    res.render("signup", { error: "Passwords do not match." });
    return;
  }

  if (await findUserByUsername(username)) {
    res.render("signup", { error: "Username is already taken." });
    return;
  }

  await createUser(username, await bcrypt.hash(password, SALT_ROUNDS));

  const newUser = await findUserByUsername(username);
  req.session.userId = newUser!.userId;
  res.redirect("/profile");
}

async function loginPost(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;
  
  if (!username || !password) {
    res.render("login", { error: "All fields are required." });
    return;
  }

  const user = await findUserByUsername(username);



  //Check if user exists and is active before comparing password hash to prevent timing attacks
  if (!user || !user.isActive) {
    res.render("login", { error: "Invalid username or password." });
    return;
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  // If the password is wrong or the user is inactive, 
  // show a generic error message to avoid giving hints to attackers
  if (!match || !user.isActive) {
    res.render("login", { error: "Invalid username or password." });
    return;
  }

  req.session.userId = user.userId;
  res.redirect("/profile");
}

// Logs the user out by destroying their session, clearing the session cookie,
// and redirecting them back to the homepage so they no longer remain authenticated.
async function logoutPost(req: Request, res: Response): Promise<void> {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send("Could not log out.");
      return;
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
}

/* old function
// Directs to login if there isn't a a session, otherwise profile
async function profileGet(req: Request, res: Response): Promise<void> {
  
  
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }

  const user = await findUserById(req.session.userId);

  if (!user) {
    res.redirect("/login");
    return;
  }
  
  res.render("profile", { user, scores: await getTop10OfUser(user.userId)});
}

*/


// Directs to login if there isn't a session,
// otherwise loads either the logged-in profile or a public profile by id
async function profileGet(req: Request, res: Response): Promise<void> {
  const profileUserId = req.params.id
    ? Number(req.params.id)
    : req.session.userId;

  if (!profileUserId) {
    res.redirect("/login");
    return;
  }

  const user = await findUserById(profileUserId);

  if (!user || !user.isActive) {
    res.redirect("/login");
    return;
  }

  const isOwnProfile = req.session.userId === user.userId;

  if (!user.isPublic && !isOwnProfile) {
    res.send(`
      <script>
        alert("This user profile is private.");
        window.history.back();
      </script>
    `);
    return;
  }

  res.render("profile", {
    user,
    scores: await getTop10OfUser(user.userId)
  });
}


// Soft deletes the logged-in user by setting isActive to false,
// then destroys the session so the deleted account is logged out.

/* Original asyn deletePost

// Soft deletes the user by setting isActive to false.

async function deletePost(req: Request, res: Response): Promise<void> { 
  // if (!req.session.userId) {
  //   res.redirect("/login");
  //   return;
  // }
  const deleted = await deleteUser(req.session.userId);



  if (!deleted) {
  
  }
  res.redirect("/home");

  // req.user.isActive = false;
  // req.session.destroy(() => {
  // }); 
}

*/
// Toggles the privacy of an account
async function togglePrivacy(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }

  const user = await findUserById(req.session.userId);

  if (!user) {
    res.redirect("/login");
    return;
  }

  if (user.isPublic) {
    const privated = await privateUser(req.session.userId);

    if (!privated) {
      res.status(500).send("Could not private account.");
      return;
    }
  } else {
    const unprivated = await publicUser(req.session.userId);

    if (!unprivated) {
      res.status(500).send("Could not make account public.");
      return;
    }
  }

  res.redirect("/profile");
}


//New deletePost with the fixes
async function deletePost(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }

  const deleted = await deleteUser(req.session.userId);

  if (!deleted) {
    res.status(500).send("Could not delete account.");
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      res.status(500).send("Account was deleted, but logout failed.");
      return;
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
}

// Handles profile picture upload: resizes to 200x200 WebP and stores raw bytes in the DB
async function profilePhotoPost(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }

  if (!req.file) {
    res.redirect("/profile");
    return;
  }

  // Crop and convert the uploaded image regardless of original format
  const webpBuffer = await sharp(req.file.buffer)
    .resize(200, 200, { fit: "cover" })
    .webp()
    .toBuffer();

  await updateUserProfilePic(req.session.userId, webpBuffer);
  res.redirect("/profile");
}

export {
  signupPost,
  loginPost,
  logoutPost,
  deletePost,
  profileGet,
  profilePhotoPost,
  togglePrivacy,
  upload
}
