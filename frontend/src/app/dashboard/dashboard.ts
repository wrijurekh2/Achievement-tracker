import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { SteamService } from '../steam';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  games: any[] = [];

  steamId = '';

  constructor (
    private steamService: SteamService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
  ){}

  ngOnInit() {

    if (!isPlatformBrowser(this.platformId)) {
        console.log("Dashboard: server - stopping");
        return;
    }

    console.log("Dashboard: browser - starting");

    this.steamService.getUser().subscribe({
        next: data => {
            console.log("Dashboard: USER:", data);

            this.steamId = data.steamId;

            console.log("Dashboard: STEAM ID:", this.steamId);

            this.loadGames();
        },
        error: error => {
            console.log("Dashboard: USER ERROR:", error);
        }
    });
}
  loadGames() {

    console.log("Dashboard: LOAD GAMES STARTED");

    this.steamService.getGames(this.steamId).subscribe({
        next: data => {
            console.log("Dashboard: GAMES RECEIVED:", data);

            this.games = data as any[];
            this.cdr.detectChanges();

            console.log(
                "Dashboard: GAMES LENGTH:",
                this.games.length
            );
        },
        error: error => {
            console.log("Dashboard: GAMES ERROR:", error);
        }
    });
  }
  test() {
    console.log("BEFORE:", this.games.length);

    this.games = [...this.games];

    console.log("AFTER:", this.games.length);
  }
}
