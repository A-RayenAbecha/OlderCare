package com.oldercare.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SessionAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String path = request.getRequestURI();

        if (isPublicPath(path)) {
            return true;
        }

        if (path.startsWith("/dashboard") || path.startsWith("/profile")) {
            HttpSession session = request.getSession(false);
            String userType = session == null ? null : (String) session.getAttribute("userType");
            if ("PATIENT".equals(userType)) {
                return true;
            }
            response.sendRedirect("/auth/login-code-page");
            return false;
        }

        if (path.startsWith("/readonly")) {
            HttpSession session = request.getSession(false);
            String userType = session == null ? null : (String) session.getAttribute("userType");
            if ("READ_ONLY".equals(userType)) {
                return true;
            }
            response.sendRedirect("/auth/login-code-page");
            return false;
        }

        return true;
    }

    private boolean isPublicPath(String path) {
        return path.equals("/")
                || path.equals("/register")
                || path.equals("/auth/welcome")
                || path.equals("/auth/login-code-page")
                || path.equals("/auth/login-code")
                || path.equals("/auth/portal")
                || path.equals("/auth/portal/patient")
                || path.equals("/auth/portal/staff")
                || path.equals("/auth/portal/autre")
                || path.equals("/auth/logout")
                || path.equals("/auth/signup/patient")
                || path.startsWith("/css/")
                || path.startsWith("/js/")
                || path.startsWith("/images/")
                || path.startsWith("/webjars/");
    }
}
