import { Component,inject } from '@angular/core';
import { RouterOutlet,RouterLink,RouterLinkActive } from "@angular/router";
import { ConnectivityService } from '../../services/connectivity';

@Component({
  selector: 'app-student-shell',
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './student-shell.html',
  styleUrl: './student-shell.css',
})
export class StudentShell {
    readonly connectivity = inject(ConnectivityService);

}
