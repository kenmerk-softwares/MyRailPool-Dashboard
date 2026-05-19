const { callableWrapper } = require("../../shared/utils/callable.wrapper");

const { tripBookingValidation, cancelTripValidation } = require("./user.validator");
const { bookTripService, cancelTripService } = require("./user.service");

const tripBooking = callableWrapper(async (req) => {
    const validateData = tripBookingValidation(req);
    if (!validateData.success) {
        return validateData;
    }
    return await bookTripService(validateData.data);
    
});

const cancelTrip = callableWrapper(async (req) => {
    const validateData = cancelTripValidation(req);
    if (!validateData.success) {
        return validateData;
    }
    return await cancelTripService(validateData.data);
    
});
    
module.exports = {
    tripBooking,
    cancelTrip
};
