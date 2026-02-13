import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  SearchMode = SearchMode;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      mode: [SearchMode.AUTHOR, Validators.required],
      query: ['', [Validators.required, Validators.minLength(2)]],
      author: [''],
      title: ['']
    });

    // Update validation based on mode
    this.searchForm.get('mode')?.valueChanges.subscribe(mode => {
      const queryControl = this.searchForm.get('query');
      const authorControl = this.searchForm.get('author');
      const titleControl = this.searchForm.get('title');

      if (mode === SearchMode.BOTH) {
        queryControl?.clearValidators();
        authorControl?.setValidators([Validators.required, Validators.minLength(2)]);
        titleControl?.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        queryControl?.setValidators([Validators.required, Validators.minLength(2)]);
        authorControl?.clearValidators();
        titleControl?.clearValidators();
      }

      queryControl?.updateValueAndValidity();
      authorControl?.updateValueAndValidity();
      titleControl?.updateValueAndValidity();
    });
  }

  get isBothMode(): boolean {
    return this.searchForm.get('mode')?.value === SearchMode.BOTH;
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      const formValue = this.searchForm.value;
      this.search.emit({
        mode: formValue.mode,
        query: formValue.query,
        author: formValue.author,
        title: formValue.title
      });
    }
  }
}
