import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AppRole } from '../../services/role-permissions';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  readonly roles: AppRole[] = ['Admin', 'Técnico', 'Estudiante', 'Auditor'];
  selectedRole: AppRole = 'Estudiante';

  constructor(private readonly authService: AuthService) {
    const currentRole = this.authService.getRole();
    if (currentRole) {
      this.selectedRole = currentRole;
    }
  }

  loginWithMicrosoft(): void {
    this.authService.login(this.selectedRole);
  }

  get roleDescription(): string {
    return this.authService.getRoleDefinition(this.selectedRole).description;
  }
}
