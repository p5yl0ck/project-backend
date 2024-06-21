class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack){
            this.stack = stack
        }else{
           Error.captureStackTrace(this, this.constructor) 
        }
    }
}

export {ApiError}

/*
ApiError: A special kind of error for APIs.
Extends Error: Builds on the basic built in 'error' class to add more information.
Constructor Parameters: Takes a status code, message, detailed errors, and stack trace.
super(message) --> calls the constructor of error class and sets the error message adding the additional params we gave
Properties: Adds properties like statusCode, data, message, success, and errors.
Stack Trace: Captures or sets the stack trace to help debug where the error happened.
This class helps create detailed, consistent error messages for your API, making it easier to handle and debug errors.
*/