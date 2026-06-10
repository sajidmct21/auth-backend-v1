export class ApiResponse {
constructor(statusCode, message, responseData,success){
this.statusCode = statusCode
this.message = message
this.responseData = responseData
this.success = success
}
}