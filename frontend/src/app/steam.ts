import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
        providedIn: 'root'
    })
export class SteamService{
    constructor(private http: HttpClient){
       
        }
    getGames(steamId: string){
        return this.http.get(
            `http://localhost:3000/api/games/${steamId}`
        )   
    }

    getAchievements(){
        return this.http.get<[ gameName: string ]>('')
    }

    getUser(){
        return this.http.get<{ steamId: string }>('http://localhost:3000/api/user');
    }

    getDatabaseGames(){
        return this.http.get("http://localhost:3000/api/database/games");
    }


}





