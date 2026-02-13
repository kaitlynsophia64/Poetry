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
  @Output() search = new EventEmitter<{ mode: SearchMode; query: string }>();

  searchForm: FormGroup;
  SearchMode = SearchMode;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      mode: [SearchMode.AUTHOR, Validators.required],
      query: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.search.emit(this.searchForm.value);
    }
  }
}
