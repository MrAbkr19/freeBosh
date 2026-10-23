import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  get dashboardUrl(): string {
    const user = this.authService.currentUser();
    return user ? this.authService.redirectPathFor(user.role) : '/login';
  }
}
