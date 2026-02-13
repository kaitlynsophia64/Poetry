import { Component, Input } from '@angular/core';
import { Poem } from '../../../../core/models/poem.model';

@Component({
  standalone: true,
  selector: 'app-poem-item',
  imports: [],
  templateUrl: './poem-item.html',
  styleUrl: './poem-item.css',
})
export class PoemItem {
  @Input() poem!: Poem;
}
