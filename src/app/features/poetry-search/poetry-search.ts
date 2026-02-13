import { Component } from '@angular/core';
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

  constructor(private poetryService: PoetryApiService) {}

  onSearch(params: { mode: SearchMode; query: string }): void {
    this.loading = true;
    this.error = null;
    this.poems = [];

    const search$ = params.mode === SearchMode.AUTHOR
      ? this.poetryService.searchByAuthor(params.query)
      : this.poetryService.searchByTitle(params.query);

    search$.pipe(
      catchError(err => {
        this.error = err;
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(poems => this.poems = poems);
  }
}
