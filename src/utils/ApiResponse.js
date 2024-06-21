class ApiResponse{
    constructor(statusCode, data, message = "success"){
        this.statusCode = statusCode
        this.data = data 
        this.message = message
        this.success = statusCode < 400
    }
}

export{ ApiResponse }

/*
ApiResponse Class: A template for creating response objects for an API.
Constructor Parameters:
statusCode: HTTP status code (e.g., 200, 404).
data: Data to include in the response.
message: Message describing the result (default is "success").
Properties Set:
statusCode: The status code provided.
data: The data provided.
message: The message provided.
success: A boolean indicating if the response is successful (true if statusCode < 400).
This class helps ensure that all your API responses are consistent and contain the necessary information.
*/