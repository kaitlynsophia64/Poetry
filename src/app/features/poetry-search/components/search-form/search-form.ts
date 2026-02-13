import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SearchMode } from '../../../../core/models/search-mode.enum';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-form.html',
  styleUrl: './search-form.css',
})
export class SearchForm {
  @Output() search = new EventEmitter<{ mode: SearchMode; query: string; author?: string; title?: string }>();

  searchForm: FormGroup;
  validationError: string | null = null;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      author: [''],
      title: ['']
    });
  }

  onSubmit(): void {
    const author = this.searchForm.get('author')?.value?.trim() || '';
    const title = this.searchForm.get('title')?.value?.trim() || '';

    // Validation
    if (!author && !title) {
      this.validationError = 'Please enter an author name or title (or both)';
      return;
    }
    if (author && author.length < 2) {
      this.validationError = 'Author name must be at least 2 characters';
      return;
    }
    if (title && title.length < 2) {
      this.validationError = 'Title must be at least 2 characters';
      return;
    }

    this.validationError = null;

    // Auto-detect search mode
    let mode: SearchMode;
    if (author && title) {
      mode = SearchMode.BOTH;
    } else if (author) {
      mode = SearchMode.AUTHOR;
    } else {
      mode = SearchMode.TITLE;
    }

    this.search.emit({
      mode,
      query: author || title,
      author,
      title
    });
  }
}
