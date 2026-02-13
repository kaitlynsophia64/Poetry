import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Poem, isValidPoem } from '../models/poem.model';
import { ApiError, ErrorType } from '../models/api-error.model';

@Injectable({
  providedIn: 'root'
})
export class PoetryApiService {
  private readonly baseUrl = 'https://poetrydb.org';

  constructor(private http: HttpClient) {}

  searchByAuthor(author: string): Observable<Poem[]> {
    if (!author || author.trim().length < 2) {
      return throwError(() => new ApiError(
        ErrorType.VALIDATION_ERROR,
        'Author name must be at least 2 characters.'
      ));
    }

    const url = `${this.baseUrl}/author/${encodeURIComponent(author.trim())}`;
    return this.http.get<any>(url).pipe(
      map(response => this.validateAndTransform(response)),
      catchError(error => throwError(() => error))
    );
  }

  searchByTitle(title: string): Observable<Poem[]> {
    if (!title || title.trim().length < 2) {
      return throwError(() => new ApiError(
        ErrorType.VALIDATION_ERROR,
        'Title must be at least 2 characters.'
      ));
    }

    const url = `${this.baseUrl}/title/${encodeURIComponent(title.trim())}`;
    return this.http.get<any>(url).pipe(
      map(response => this.validateAndTransform(response)),
      catchError(error => throwError(() => error))
    );
  }

  searchByAuthorAndTitle(author: string, title: string): Observable<Poem[]> {
    if (!author || author.trim().length < 2) {
      return throwError(() => new ApiError(
        ErrorType.VALIDATION_ERROR,
        'Author name must be at least 2 characters.'
      ));
    }
    if (!title || title.trim().length < 2) {
      return throwError(() => new ApiError(
        ErrorType.VALIDATION_ERROR,
        'Title must be at least 2 characters.'
      ));
    }

    const url = `${this.baseUrl}/author,title/${encodeURIComponent(author.trim())};${encodeURIComponent(title.trim())}`;
    return this.http.get<any>(url).pipe(
      map(response => this.validateAndTransform(response)),
      catchError(error => throwError(() => error))
    );
  }

  private validateAndTransform(response: any): Poem[] {
    // Check if response is a PoetryDB error object
    if (response && typeof response === 'object' && 'status' in response && 'reason' in response) {
      const status = parseInt(response.status);
      const userMessage = status === 404
        ? 'No poems found matching your search. Please try a different author or title.'
        : 'Error from PoetryDB API. Please try again later.';

      throw new ApiError(
        status === 404 ? ErrorType.NOT_FOUND : ErrorType.API_ERROR,
        userMessage,
        status
      );
    }

    // Check if response is an array
    if (!Array.isArray(response)) {
      throw new ApiError(
        ErrorType.VALIDATION_ERROR,
        'Invalid data received from API.'
      );
    }

    // Filter valid poems
    const validPoems = response.filter(isValidPoem);

    // Throw error if no valid poems found
    if (validPoems.length === 0) {
      throw new ApiError(
        ErrorType.NOT_FOUND,
        'No valid poems found.'
      );
    }

    return validPoems;
  }
}
