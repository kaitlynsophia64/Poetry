import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, ErrorType } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      let apiError: ApiError;

      if (error.status === 0) {
        apiError = new ApiError(
          ErrorType.NETWORK_ERROR,
          'Network error. Please check your connection.'
        );
      } else if (error.status === 404) {
        apiError = new ApiError(
          ErrorType.NOT_FOUND,
          'No poems found matching your search.'
        );
      } else if (error.status >= 500) {
        apiError = new ApiError(
          ErrorType.API_ERROR,
          'Server error. Please try again later.'
        );
      } else {
        apiError = new ApiError(
          ErrorType.API_ERROR,
          'An error occurred while fetching poems.',
          error
        );
      }

      return throwError(() => apiError);
    })
  );
};
