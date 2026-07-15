import { HttpInterceptorFn } from '@angular/common/http';
import { getAuth } from 'firebase/auth';
import { from, switchMap } from 'rxjs';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user && req.url.startsWith(environment.apiUrl)) {
    return from(user.getIdToken()).pipe(
      switchMap(token => {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
      })
    );
  }
  return next(req);
};
