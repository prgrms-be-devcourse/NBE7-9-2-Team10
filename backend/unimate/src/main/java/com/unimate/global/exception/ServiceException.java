package com.unimate.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

//서비스에서 발생하는 예외 처리용 공통 예외 클래스
@Getter
public class ServiceException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public ServiceException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }



    public static ServiceException badRequest(String message) {
        return new ServiceException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
    }

    public static ServiceException unauthorized(String message) {
        return new ServiceException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }

    public static ServiceException notFound(String message) {
        return new ServiceException(HttpStatus.NOT_FOUND, "NOT_FOUND", message);
    }

    public static ServiceException conflict(String message) {
        return new ServiceException(HttpStatus.CONFLICT, "CONFLICT", message);
    }

    public static ServiceException forbidden(String message) {
        return new ServiceException(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }
}

