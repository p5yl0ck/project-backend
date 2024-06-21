// similar function down this one using promises 
// this async handler is a helper function which help catch error and pass control to next error handling middlewares

const asyncHandler = (requestHandler) => {
   return (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next)).catch((err)=> next(err))
    }
}



export{asyncHandler}




// async handler using try catch 
//  accepts a function and passes it into another funtion 
// thus syntax breakdown  const asynchand = (fn) = {async()=>{ try... catch...}}

// const asyncHandler = (fn) => async ( req,res,next) => {
//     try{
//         await fn(req, res, next)
//     } catch (error){
//         res.status(err.code ||500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }  