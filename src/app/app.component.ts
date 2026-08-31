import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
@Component({
selector: 'app-root',standalone: true,imports: [CommonModule, RouterOutlet],templateUrl: './app.component.html',
})
export class AppComponent {
constructor(private readonly authService: AuthService) {}

isLoggedIn(): boolean {return this.authService.isLoggedIn();}
login(): void {this.authService.login();}
logout(): void {this.authService.logout();}
}