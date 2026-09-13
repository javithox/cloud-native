import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { getRoleDefinition } from '../../services/role-permissions';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage {
  constructor(private readonly authService: AuthService) {}

  get currentRole(): string {
    return this.authService.getRole() ?? 'Estudiante';
  }

  get roleDefinition() {
    return getRoleDefinition(this.authService.getRole());
  }

  metrics() {
    return this.roleDefinition.metrics;
  }

  actions() {
    return this.roleDefinition.actions;
  }

  capabilities() {
    return this.roleDefinition.capabilities;
  }
}
