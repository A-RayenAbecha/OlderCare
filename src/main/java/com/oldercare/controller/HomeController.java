package com.oldercare.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/")
    public String home(HttpSession session) {
        return redirectForSession(session);
    }

    @GetMapping("/login")
    public String springLoginFallback(HttpSession session) {
        return redirectForSession(session);
    }

    private String redirectForSession(HttpSession session) {
        if (session != null && session.getAttribute("userId") != null
                && "PATIENT".equals(session.getAttribute("userType"))) {
            return "redirect:/dashboard";
        }
        if (session != null && session.getAttribute("userId") != null
                && "READ_ONLY".equals(session.getAttribute("userType"))) {
            return "redirect:/readonly/profile";
        }
        return "redirect:/auth/welcome";
    }
}
