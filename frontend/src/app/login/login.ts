import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  loginwithsteam(){
    window.location.href='http://localhost:3000/auth/steam';
  }
}
