# Poetry Search Application - Implementation Plan

## Overview
Build an Angular v17+ application that searches poems from PoetryDB API, with support for author and title searches, robust error handling, and deployment to Vercel.

## Requirements Summary
- **Framework**: Angular v17+ with standalone components
- **API**: https://poetrydb.org
- **Search Modes**: Author and Title endpoints
- **Error Handling**: Validate responses, handle network/API errors
- **Display**: List format showing title and author
- **Deployment**: Vercel

---

## Architecture

### Project Structure
```
poetry/
├── src/app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── poem.model.ts              # Poem interface & validation
│   │   │   ├── search-mode.enum.ts        # AUTHOR | TITLE
│   │   │   └── api-error.model.ts         # Error types
│   │   ├── services/
│   │   │   └── poetry-api.service.ts      # API service with validation
│   │   └── interceptors/
│   │       └── error.interceptor.ts       # HTTP error handling
│   ├── features/poetry-search/
│   │   ├── components/
│   │   │   ├── search-form/               # Search input component
│   │   │   ├── poem-list/                 # Results list
│   │   │   └── poem-item/                 # Single poem display
│   │   └── poetry-search.component.ts     # Container component
│   ├── shared/components/
│   │   ├── error-display/                 # Error messages
│   │   └── loading-spinner/               # Loading state
│   ├── app.component.ts
│   ├── app.config.ts                      # HttpClient setup
│   └── main.ts
├── vercel.json                            # Vercel config
└── package.json
```

---

## Critical Files

### 1. Poem Model (`src/app/core/models/poem.model.ts`)
**Purpose**: Define Poem interface and validation logic

```typescript
export interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: number;
}

// Type guard for API response validation
export function isValidPoem(obj: any): obj is Poem {
  return (
    obj &&
    typeof obj.title === 'string' && obj.title.trim() !== '' &&
    typeof obj.author === 'string' && obj.author.trim() !== '' &&
    Array.isArray(obj.lines) &&
    typeof obj.linecount === 'number'
  );
}
```

### 2. Error Models (`src/app/core/models/api-error.model.ts`)
**Purpose**: Define error types and custom error class

```typescript
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND'
}

export class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 3. Poetry API Service (`src/app/core/services/poetry-api.service.ts`)
**Purpose**: Make REST calls to PoetryDB and validate responses

**Key Methods**:
- `searchByAuthor(author: string): Observable<Poem[]>`
- `searchByTitle(title: string): Observable<Poem[]>`
- `validateAndTransform(response: any): Poem[]`

**Validation Logic**:
1. Check response is an array
2. Filter poems using `isValidPoem()` type guard
3. Throw `VALIDATION_ERROR` if no valid poems found
4. Return only poems with valid title and author

**Error Handling**:
- Empty/invalid input → throw `VALIDATION_ERROR`
- Network errors (status 0) → caught by interceptor → `NETWORK_ERROR`
- HTTP 404 → `NOT_FOUND`
- HTTP 500+ → `API_ERROR`
- Invalid response structure → `VALIDATION_ERROR`

### 4. Error Interceptor (`src/app/core/interceptors/error.interceptor.ts`)
**Purpose**: Global HTTP error handling

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      let apiError: ApiError;

      if (error.status === 0) {
        apiError = new ApiError(ErrorType.NETWORK_ERROR,
          'Network error. Please check your connection.');
      } else if (error.status === 404) {
        apiError = new ApiError(ErrorType.NOT_FOUND,
          'No poems found matching your search.');
      } else if (error.status >= 500) {
        apiError = new ApiError(ErrorType.API_ERROR,
          'Server error. Please try again later.');
      } else {
        apiError = new ApiError(ErrorType.API_ERROR,
          'An error occurred while fetching poems.');
      }

      return throwError(() => apiError);
    })
  );
};
```

### 5. App Configuration (`src/app/app.config.ts`)
**Purpose**: Provide HttpClient and interceptors

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([errorInterceptor]))
  ]
};
```

### 6. Search Form Component (`src/app/features/poetry-search/components/search-form/`)
**Purpose**: User input for search mode and query

- Radio buttons for mode selection (Author/Title)
- Text input with validation (min 2 characters)
- Uses ReactiveFormsModule
- Emits search event: `{ mode: SearchMode, query: string }`

### 7. Poetry Search Container (`src/app/features/poetry-search/poetry-search.component.ts`)
**Purpose**: Manage search state and coordinate child components

**State**:
```typescript
poems: Poem[] = [];
loading = false;
error: ApiError | null = null;
```

**Search Handler**:
```typescript
onSearch(params: { mode: SearchMode; query: string }): void {
  this.loading = true;
  this.error = null;

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
```

**Template** (using Angular v17+ control flow):
```html
<app-search-form (search)="onSearch($event)" />

@if (loading) {
  <app-loading-spinner />
}

@if (error) {
  <app-error-display [error]="error" />
}

@if (!loading && !error && poems.length > 0) {
  <app-poem-list [poems]="poems" />
}
```

### 8. Vercel Configuration (`vercel.json`)
**Purpose**: Configure SPA deployment with routing fallback

```json
{
  "version": 2,
  "builds": [{
    "src": "package.json",
    "use": "@vercel/static-build",
    "config": { "distDir": "dist/poetry/browser" }
  }],
  "routes": [{
    "src": "/(.*)",
    "dest": "/index.html"
  }]
}
```

---

## Implementation Steps

### Phase 1: Setup (Critical First Steps)
1. **Switch GitHub Account** ⚠️ IMPORTANT
   ```bash
   gh auth switch --user kaitlynsophia64
   git config user.name "kaitlynsophia64"
   git config user.email "[your-email]"
   ```

2. **Initialize Angular Project**
   ```bash
   ng new poetry --standalone --routing=false --style=css --skip-git
   cd poetry
   ```

3. **Create Directory Structure**
   ```bash
   mkdir -p src/app/core/{models,services,interceptors}
   mkdir -p src/app/features/poetry-search/components/{search-form,poem-list,poem-item}
   mkdir -p src/app/shared/components/{error-display,loading-spinner}
   ```

### Phase 2: Core Layer
4. **Create Models** (in order)
   - `search-mode.enum.ts` - SearchMode enum
   - `api-error.model.ts` - ErrorType enum and ApiError class
   - `poem.model.ts` - Poem interface and isValidPoem() type guard

5. **Create Error Interceptor**
   - `error.interceptor.ts` - HTTP error handler

6. **Create Poetry API Service**
   - `poetry-api.service.ts` - API methods with validation
   - Implement searchByAuthor()
   - Implement searchByTitle()
   - Implement validateAndTransform()

7. **Configure Application**
   - Update `app.config.ts` - provide HttpClient with interceptor
   - Update `main.ts` - bootstrap with appConfig

### Phase 3: Components (Bottom-Up)
8. **Generate Shared Components**
   ```bash
   ng generate component shared/components/loading-spinner --standalone
   ng generate component shared/components/error-display --standalone
   ```
   - LoadingSpinnerComponent: CSS spinner animation
   - ErrorDisplayComponent: Display ApiError with styling

9. **Generate Feature Components**
   ```bash
   ng generate component features/poetry-search/components/poem-item --standalone
   ng generate component features/poetry-search/components/poem-list --standalone
   ng generate component features/poetry-search/components/search-form --standalone
   ng generate component features/poetry-search --standalone
   ```

   - **PoemItemComponent**: Display title and author
   - **PoemListComponent**: Loop through poems, show PoemItems
   - **SearchFormComponent**: Form with mode selector and query input
   - **PoetrySearchComponent**: Container managing state and search flow

10. **Update App Component**
    - Import and use PoetrySearchComponent
    - Add basic header/styling

### Phase 4: Deployment Setup
11. **Create Vercel Configuration**
    - Create `vercel.json` with SPA config
    - Update `package.json` with vercel-build script
    - Verify `angular.json` outputPath matches vercel.json distDir

12. **Test Production Build Locally**
    ```bash
    npm run build
    # Verify dist/poetry/browser directory exists
    ```

13. **Deploy to Vercel**
    ```bash
    vercel --prod
    ```

---

## Error Handling Matrix

| Scenario | Detection | Error Type | User Message |
|----------|-----------|------------|--------------|
| Network offline | `status === 0` | `NETWORK_ERROR` | "Network error. Please check your connection." |
| Not found | `status === 404` | `NOT_FOUND` | "No poems found matching your search." |
| Server error | `status >= 500` | `API_ERROR` | "Server error. Please try again later." |
| Invalid response | `!Array.isArray()` | `VALIDATION_ERROR` | "Invalid data received from API." |
| Missing fields | `!isValidPoem()` | `VALIDATION_ERROR` | "Some poems have missing data." |
| Empty results | `validPoems.length === 0` | `NOT_FOUND` | "No valid poems found." |

---

## API Endpoints

### Author Search
```
GET https://poetrydb.org/author/{author-name}
```

### Title Search
```
GET https://poetrydb.org/title/{poem-title}
```

### Response Format
```json
[
  {
    "title": "Sonnet 18",
    "author": "William Shakespeare",
    "lines": ["Shall I compare thee...", ...],
    "linecount": 14
  }
]
```

---

## Verification Plan

### End-to-End Testing
1. **Author Search**
   - Search "Shakespeare" → should display list of poems
   - Search "InvalidAuthor123" → should show "No poems found"
   - Search with network disabled → should show network error

2. **Title Search**
   - Search "Sonnet" → should display matching poems
   - Search "ZZZ" → should show "No poems found"

3. **Error Scenarios**
   - Empty input → form validation prevents submit
   - Single character → form validation prevents submit
   - Valid search with no results → displays "not found" error
   - Simulate 500 error → displays server error message

4. **UI States**
   - Loading spinner shows during request
   - Error display shows appropriate error message
   - Results display as list with title and author
   - Form clears error on new search

5. **Deployment**
   - Verify app loads on Vercel URL
   - Test search functionality in production
   - Verify SPA routing works (direct URL access)

---

## Pre-Implementation Checklist

- [ ] GitHub CLI switched to kaitlynsophia64 account
- [ ] Git user.name and user.email configured
- [ ] Angular CLI installed (v17+)
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Understanding of PoetryDB API endpoints
- [ ] Understanding of error handling requirements

---

## Notes
- Use Angular v17+ new control flow syntax (`@if`, `@for`)
- All components must be standalone (no NgModules)
- Validation happens at service layer (type guards)
- Errors categorized by type for appropriate user messages
- Vercel deployment requires SPA routing configuration
