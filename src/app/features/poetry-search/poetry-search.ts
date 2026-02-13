import { Component, ChangeDetectorRef } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { SearchForm } from './components/search-form/search-form';
import { PoemList } from './components/poem-list/poem-list';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { ErrorDisplay } from '../../shared/components/error-display/error-display';
import { PoetryApiService } from '../../core/services/poetry-api.service';
import { Poem } from '../../core/models/poem.model';
import { SearchMode } from '../../core/models/search-mode.enum';
import { ApiError } from '../../core/models/api-error.model';

@Component({
  standalone: true,
  selector: 'app-poetry-search',
  imports: [SearchForm, PoemList, LoadingSpinner, ErrorDisplay],
  templateUrl: './poetry-search.html',
  styleUrl: './poetry-search.css',
})
export class PoetrySearch {
  poems: Poem[] = [];
  loading = false;
  error: ApiError | null = null;

  constructor(
    private poetryService: PoetryApiService,
    private cdr: ChangeDetectorRef
  ) {}

  onSearch(params: { mode: SearchMode; query: string; author?: string; title?: string }): void {
    this.loading = true;
    this.error = null;
    this.poems = [];

    let search$;
    if (params.mode === SearchMode.BOTH) {
      search$ = this.poetryService.searchByAuthorAndTitle(params.author!, params.title!);
    } else if (params.mode === SearchMode.AUTHOR) {
      search$ = this.poetryService.searchByAuthor(params.query);
    } else {
      search$ = this.poetryService.searchByTitle(params.query);
    }

    search$.subscribe({
      next: (poems) => {
        this.poems = poems;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
