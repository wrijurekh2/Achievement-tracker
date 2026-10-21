import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SteamService } from '../steam';
import { isPlatformBrowser } from '@angular/common';

@Component({
  imports: [],
  selector: 'app-achievements',
  styleUrl: './achievements.css',
  templateUrl: './achievements.html',
})
export class Achievements implements OnInit{
  games: any[] = [];
  currGame:any = signal<any>(null);
  
  constructor(
    private route: ActivatedRoute,
    private steamService: SteamService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit(){

    const appid = Number(this.route.snapshot.paramMap.get('appid'));

    console.log("ACHIEVEMENTS COMPONENT STARTED");
    console.log("APP ID:", appid);

    this.steamService.getUser().subscribe(data => {

      console.log("ACHIEVEMENTS USER:", data);

      const steamId = data.steamId;

      this.steamService.getGames(steamId).subscribe(data => {

        console.log("ACHIEVEMENTS GAMES RECEIVED:", data);

        this.games = data as any[];
        this.currGame.set(
          this.games.find(game => game.appid === appid)
        );

        console.log("CURRENT GAME:", this.currGame());
      });

    });

  }

  test(){
    console.log("button clicked");
  }
}
