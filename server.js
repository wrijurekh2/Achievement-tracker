require("dotenv").config();

const express = require("express");

const cors = require("cors");

const app = express();

const { createClient } = require("@supabase/supabase-js");

app.use(cors({
    origin: "http://localhost:4200"
}));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY

)

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/";

let loggedInSteamID = null;

app.get("/", (req, res) => {
    res.send("Steam Achievement Tracker");
});

app.get("/auth/steam", (req, res) => {

    const returnUrl = "http://localhost:3000/auth/steam/callback";

    const params = new URLSearchParams({
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": returnUrl,
        "openid.realm": "http://localhost:3000/",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
    });

    const steamLoginUrl = `${STEAM_OPENID_URL}login?${params.toString()}`;

    res.redirect(steamLoginUrl);
});

app.get("/auth/steam/callback", async (req, res) => {

    const params = new URLSearchParams(req.query);

    params.set("openid.mode", "check_authentication");

    try {

        const response = await fetch("https://steamcommunity.com/openid/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        const result = await response.text();

        console.log("Steam verification response:");
        console.log(result);

        if (result.includes("is_valid:true")) {

            console.log("Steam authentication is valid!");

            const claimedId = req.query["openid.claimed_id"];

            console.log("Claimed ID:");
            console.log(claimedId);

            const steamId = claimedId.split("/").pop();

            console.log("Steam ID64:");
            console.log(steamId);

            loggedInSteamID = steamId;

            res.redirect(`http://localhost:4200/dashboard`);

        }
        else {

            console.log("Steam authentication failed!");

            res.status(401).send("Steam login could not be verified.");

        }

    } catch (error) {

        console.error("Verification error:", error);

        res.status(500).send("Something went wrong.");

    }

});

app.get("/api/games/:steamId", async (req, res) => {

    const steamId = req.params.steamId;

    const gamesUrl = new URL(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
    );

    gamesUrl.searchParams.set("key", process.env.STEAM_API_KEY);
    gamesUrl.searchParams.set("steamid", steamId);
    gamesUrl.searchParams.set("include_appinfo", "true");

    try {

        // Get the user's games
        const gamesResponse = await fetch(gamesUrl);

        if (!gamesResponse.ok) {
            return res.status(gamesResponse.status).json({
                error: "Failed to retrieve games from Steam"
            });
        }

        const gamesData = await gamesResponse.json();

        const games = gamesData.response.games || [];

        const result = [];

        // Get achievements for each game
        for (const game of games) {

            const schemaUrl = new URL(
                "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/"
            );

            schemaUrl.searchParams.set(
                "key",
                process.env.STEAM_API_KEY
            );

            schemaUrl.searchParams.set(
                "appid",
                game.appid
            );

            const schemaResponse = await fetch(schemaUrl);

            if (!schemaResponse.ok) {
                continue;
            }

            const schemaData = await schemaResponse.json();

            const achievementsUrl = new URL(
                "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/"
            );

            achievementsUrl.searchParams.set(
                "key",
                process.env.STEAM_API_KEY
            );

            achievementsUrl.searchParams.set(
                "steamid",
                steamId
            );

            achievementsUrl.searchParams.set(
                "appid",
                game.appid
            );

            const achievementsResponse = await fetch(achievementsUrl);

            if (!achievementsResponse.ok) {
                continue;
            }

            const achievementsData = await achievementsResponse.json();

            const playerAchievements = achievementsData.playerstats?.achievements || [];
            
            const schemaAchievements = schemaData.game?.availableGameStats?.achievements || [];

            const achievements = playerAchievements.map(playerAchievement => {
                const schemaAchievement = schemaAchievements.find(
                    achievement => achievement.name === playerAchievement.apiname
                );

                if (!schemaAchievement) {
                    return null;
                }

                return {
                    name: schemaAchievement.displayName,
                    description: schemaAchievement.description,
                    completed: playerAchievement.achieved === 1
                };

            }).filter(achievement => achievement !== null);

            /*const { data, error } = await supabase
                .from("games")
                .upsert({
                    appid: game.appid,
                    game_name: game.name
                },{
                    onConflict: "appid"
                })
                .select();

            if (error) {
                console.log("Supabase error:", error);
            } else {
                console.log("Game inserted:", data);
                const gameId = data[0].id;
                console.log("DATABASE GAME ID:", gameId);
                for (const achievement of achievements) {
                    const { data: achievementData, error: achievementError } = await supabase
                        .from("Achievements")
                        .upsert({
                            gameid: gameId,
                            name: achievement.name,
                            description: achievement.description,
                            completed: achievement.completed
                        })
                        .select();

                    if (achievementError) {
                        console.log("Achievement error:", achievementError);
                    } else {
                        console.log("Achievement inserted:", achievementData);
                    }
                }
            }*/


            result.push({
                appid: game.appid,
                gameName: game.name,
                achievements: achievements
            });
        }
        

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong"
        });

    }
});

app.get("/api/user/", (req, res) => {
    res.json({
        steamId: loggedInSteamID
    });
});

app.get("/api/database/games", async (req, res) => {
    const { data, error } = await supabase
        .from("games")
        .select("*");
    if (error){
        console.log("Database error:", error);
        res.status(500).json(error);
    }
    else{
        console.log("Games from database:", data);
        res.json(data);
    }
    });

app.listen(3000, () => {
    console.log("Server has been started on localhost:3000");
});