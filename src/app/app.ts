import { Component } from '@angular/core';
import { PoetrySearch } from './features/poetry-search/poetry-search';

@Component({
  selector: 'app-root',
  imports: [PoetrySearch],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Poetry Search Application';
}
