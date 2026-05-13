import Joi from 'joi';

export const DriverValidationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Full name is required',
            'any.required': 'Full name is a mandatory field'
        }),
    
    status: Joi.string()
        .valid('active', 'inactive', 'on_leave', 'suspended')
        .required()
        .messages({
            'any.only': 'Please select a valid account status',
            'any.required': 'Account status is required'
        }),

    mobile: Joi.string()
        .required()
        .pattern(/^(?:(?:\+|00)44|0)[1-9]\d{8,11}$/)
        .messages({
            'string.empty': 'Mobile number is required',
            'string.pattern.base': 'Please enter a valid UK or international mobile number (e.g., 07123456789 or +447123456789)',
            'any.required': 'Mobile number is mandatory'
        }),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: true } })
        .required()
        .messages({
            'string.empty': 'Email address is required',
            'string.email': 'Please enter a professional and valid email address (e.g., name@example.com)',
            'any.required': 'Email address is mandatory'
        }),

    address: Joi.string()
        .required()
        .messages({
            'string.empty': 'Residential address is required',
            'any.required': 'Residential address is mandatory'
        }),

    phLicenseNumber: Joi.string()
        .required()
        .messages({
            'string.empty': 'PH License Number is required',
            'any.required': 'PH License Number is mandatory'
        }),

    phExpiryDate: Joi.date()
        .required()
        .messages({
            'date.base': 'PH Expiry must be a valid date',
            'any.required': 'PH Expiry date is required'
        }),

    dvlaLicenseNumber: Joi.string()
        .required()
        .messages({
            'string.empty': 'DVLA License Number is required',
            'any.required': 'DVLA License Number is mandatory'
        }),

    dvlaExpiryDate: Joi.date()
        .required()
        .messages({
            'date.base': 'DVLA Expiry must be a valid date',
            'any.required': 'DVLA Expiry date is required'
        }),

    dbsCertificateNumber: Joi.string()
        .required()
        .messages({
            'string.empty': 'DBS Certificate Number is required',
            'any.required': 'DBS Certificate Number is mandatory'
        }),

    dbsDateOfIssue: Joi.date()
        .required()
        .messages({
            'date.base': 'DBS Issue date must be a valid date',
            'any.required': 'DBS Issue date is required'
        }),

    medicalExemption: Joi.string()
        .valid('Yes', 'No')
        .required()
        .messages({
            'any.only': 'Please select a valid medical exemption status',
            'any.required': 'Medical exemption status is required'
        }),

    trainingStatus: Joi.string()
        .valid('Yes', 'No')
        .required()
        .messages({
            'any.only': 'Please select a valid training status',
            'any.required': 'Training status is required'
        }),

    trainingSignedDate: Joi.date()
        .required()
        .messages({
            'date.base': 'Training Signed Date must be a valid date',
            'any.required': 'Training signed date is required'
        }),

    councilNotified: Joi.string()
        .valid('Yes', 'No')
        .required()
        .messages({
            'any.only': 'Please select if the council was notified',
            'any.required': 'Council notification status is required'
        }),

    rtwVerifiedDate: Joi.date()
        .required()
        .messages({
            'date.base': 'Right to Work Verified Date must be a valid date',
            'any.required': 'RTW verified date is required'
        }),

    serviceStartDate: Joi.date()
        .required()
        .messages({
            'date.base': 'Service Start Date must be a valid date',
            'any.required': 'Service start date is required'
        }),

    contractEndDate: Joi.date()
        .required()
        .messages({
            'date.base': 'Contract End Date must be a valid date',
            'any.required': 'Contract end date is required'
        })
});