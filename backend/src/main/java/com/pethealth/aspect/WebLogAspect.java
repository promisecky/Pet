package com.pethealth.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class WebLogAspect {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 定义切点，拦截 com.pethealth.controller 包下的所有类的所有方法
    @Pointcut("execution(public * com.pethealth.controller..*.*(..))")
    public void webLog() {
    }

    @Around("webLog()")
    public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = null;
        if (attributes != null) {
            request = attributes.getRequest();
        }

        // 打印请求信息
        if (request != null) {
            log.info("========================================== Start ==========================================");
            log.info("URL            : {}", request.getRequestURL().toString());
            log.info("HTTP Method    : {}", request.getMethod());
            log.info("Class Method   : {}.{}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());
            log.info("IP             : {}", request.getRemoteAddr());
            log.info("Request Args   : {}", Arrays.toString(joinPoint.getArgs()));
        }

        Object result;
        try {
            result = joinPoint.proceed();
        } catch (Throwable e) {
            log.error("Exception in method: {}.{}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());
            log.error("Exception details: ", e);
            throw e;
        }

        // 打印响应信息
        if (request != null) {
            log.info("Response       : {}", serializeResult(result));
            log.info("Time Consumed  : {} ms", System.currentTimeMillis() - startTime);
            log.info("=========================================== End ===========================================");
        }
        
        return result;
    }

    private String serializeResult(Object result) {
        if (result == null) return "null";
        try {
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            return result.toString();
        }
    }
}
