const { callableWrapper } = require("../../shared/utils/callable.wrapper");

const { tripBookingValidation } = require("./user.validator");
const { bookTripService } = require("./user.service");

const tripBooking = callableWrapper(async (req) => {
    const validateData = tripBookingValidation(req);
    if (!validateData.success) {
        return validateData;
    }
    return await bookTripService(validateData.data);
    
});
    
module.exports = {
    tripBooking,
};
