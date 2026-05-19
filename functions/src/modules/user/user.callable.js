const { callableWrapper } = require("../../shared/utils/callable.wrapper");

const { tripBookingValidation, createUserValidation } = require("./user.validator");
const { bookTripService, createUserService } = require("./user.service");

const tripBooking = callableWrapper(async (req) => {
    const validateData = tripBookingValidation(req);
    if (!validateData.success) {
        return validateData;
    }
    return await bookTripService(validateData.data);
    
});
const createUser = callableWrapper(async (req) => {
    const validateData = createUserValidation(req);
    if (!validateData.success) {
        return validateData;
    }
    return await createUserService(validateData.data);
});

module.exports = {
    tripBooking,
    createUser,
};
