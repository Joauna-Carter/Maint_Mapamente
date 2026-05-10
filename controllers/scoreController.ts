import {type Response, type Request} from 'express'
import * as Model from "../models/scoreModel.js"
import { findUserById } from '../models/userModel.js';
import {type ScoreEntry, type Score} from "../types.js";
import { getCityById } from '../models/cityModel.js';

//Function to pull the top 10 scores of a given city
async function supply10FromCityAndPersonalBest(req: Request, res: Response){
    //pull id from the url leaderboard/:id
    const cityId = Number(req.params['id'] as string);
    //call the function from the Model, then map function to convert ScoreEntry to Score, then merge promises
    const top10 = await Promise.all((await Model.pullTop10OfCity(cityId)).map(entry => convertScoreEntryToScore(entry)));
    //assign personal best, undefined if the user is a guest
    let personalBest: (ScoreEntry | undefined) = undefined;
    const userId: number | undefined = req.session.userId;
    //If user is logged in, find their personal best and pass that through as well
    if(userId){
        personalBest = await Model.getPersonalBest(userId, cityId);
    }
    //pass to leaderboardTemple and get cityname from the cityId
    res.render('leaderboardTemplate', {scores:top10,cityName: (await getCityById(cityId)).cityName, personalBest});
}

//Function to pull the top 10 scores of a user, not a response, just a function
async function getTop10OfUser(userId:number): Promise<Score[]> {
    //Similar to above, pull from model, convert to Score form, then combine the promise statements
    const temp = Promise.all((await Model.pullTop10OfUser(userId)).map(entry => convertScoreEntryToScore(entry)));
    return temp
}

//Simple function to convert the ScoreEntry to the Score form to pass around
async function convertScoreEntryToScore(entry: ScoreEntry): Promise<Score>{
    //simple function, pull the username and cityname, and push all the information.
    //const temp = {username: (await findUserById(entry.userId))!.username, correctCount: entry.correctCount, 
        //score: entry.score, cityName: (await getCityById(entry.cityId)).cityName};
        
        //this new temp does clickable usernames
        const temp = {
            userId: entry.userId,
            username: (await findUserById(entry.userId))!.username,
            correctCount: entry.correctCount, 
            score: entry.score,
            cityName: (await getCityById(entry.cityId)).cityName
        };
    return temp
}



//Function to provide the information for the homepage
async function homePage(req:Request,res:Response){
    res.render("home",{
        scores: await Promise.all((await Model.pullTop10Total()).map(entry => convertScoreEntryToScore(entry)))
    })
}

export {
    supply10FromCityAndPersonalBest,
    getTop10OfUser,
    homePage
}
