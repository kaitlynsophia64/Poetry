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
  expanded = false;

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  get wordCount(): number {
    return this.poem.lines
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }
}
