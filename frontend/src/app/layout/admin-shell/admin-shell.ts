import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { initialsFor } from '../../utils/document-formatting';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  get initials(): string {
    return initialsFor(this.currentUser()?.fullName);
  }
}