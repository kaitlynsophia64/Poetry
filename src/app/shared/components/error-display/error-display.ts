import { Component, Input } from '@angular/core';
import { ApiError } from '../../../core/models/api-error.model';

@Component({
  standalone: true,
  selector: 'app-error-display',
  imports: [],
  templateUrl: './error-display.html',
  styleUrl: './error-display.css',
})
export class ErrorDisplay {
  @Input() error: ApiError | null = null;
}
