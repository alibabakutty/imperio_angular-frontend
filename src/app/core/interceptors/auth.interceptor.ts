import { HttpInterceptorFn } from "@angular/common/http";


export const authInterceptor: HttpInterceptorFn = (req, next) => {
    console.log("🔥 INTERCEPTOR HIT");   // MUST PRINT
    const token = localStorage.getItem('authToken');

    console.log('INTERCEPTOR RUNNING');   // ✅ ADD
    console.log('TOKEN:', token);         // ✅ ADD

    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }
    return next(req);
}