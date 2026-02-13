import { Component, Input } from '@angular/core';
import { Poem } from '../../../../core/models/poem.model';
import { PoemItem } from '../poem-item/poem-item';

@Component({
  standalone: true,
  selector: 'app-poem-list',
  imports: [PoemItem],
  templateUrl: './poem-list.html',
  styleUrl: './poem-list.css',
})
export class PoemList {
  @Input() poems: Poem[] = [];
}
