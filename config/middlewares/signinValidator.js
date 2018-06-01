class Validator{
    static signin(req, res, next){
        req.checkBody({
            email: {
              notEmpty: true,
              isEmail: {
                errorMessage: 'Provide a valid Email Address'
              },
              errorMessage: 'Your Email Address is required'
            },
      
            password: {
              notEmpty: true,
              errorMessage: 'Your Password is required'
            },
          });
          const errors = req.validationErrors();
            if (errors) {
            const allErrors = [];
            errors.forEach((error) => {
                allErrors.push({
                error: error.msg
                });
            });
            return res.status(404)
                .json(allErrors[0]);
            }

            next();
          
    }
}

module.exports = Validator;