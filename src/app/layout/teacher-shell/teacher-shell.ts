import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ConnectivityService } from '../../services/connectivity';

@Component({
  selector: 'app-teacher-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './teacher-shell.html',
  styleUrl: './teacher-shell.css',
})
export class TeacherShell {
  readonly connectivity = inject(ConnectivityService);
}