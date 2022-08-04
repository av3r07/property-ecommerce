
require('dotenv').config();
require('./db/database');
const aws = require('aws-sdk');
const path = require('path');
const sharp = require('sharp');
const express = require('express');
const cors = require('cors');
const { body, param } = require('express-validator');
const { userSignup, userLogin, fetchUserDetails, fetchUsers, activateDeactivateUser, userChangePassword, userLogout, userForgotPassword, userResetPassword, addUserDocs, deleteUserDoc, fetchUserDocs, sendUserVerificationMail, userVerification } = require('./Controllers/users');
const { adminLogin, fetchAdminDetails, addAdmin, addSuperAdmin, editAdmin, editAdminById, fetchAdmins, fetchSuperAdmins, activateDeactivateAdmin, adminChangePassword, adminLogout, adminForgotPassword, adminResetPassword, dashboard } = require('./Controllers/admin');
const { addServiceProvider, editServiceProvider, serviceProviderLogin, editServiceProviderById, activateDeactivateServiceProvider, serviceProviderVerification, fetchServiceProviderDetails, fetchServiceProviders, serviceProviderChangePassword, serviceProviderLogout, serviceProviderForgotPassword, serviceProviderResetPassword, sendServiceProviderVerificationMail } = require('./Controllers/serviceProvider');
const { addPropertyType, editPropertyType, activateDeactivatePropertyType, fetchPropertyTypes, fetchActivePropertyTypes } = require('./Controllers/propertyTypes');
const { addPropertyService, editPropertyService, activateDeactivatePropertyService, fetchPropertyServices } = require('./Controllers/propertyServices')
const { addBuilder, editBuilder, activateDeactivateBuilder, fetchBuilders } = require('./Controllers/builders');
const { addProperty, editProperty, fetchPropertyAddEditData, fetchProperties, fetchPropertyById, activateDeactivateProperty, propertyApproval, setTopProperty, showProperties, showTopProperties, showProperty, fetchPropertiesSearchData, viewedProperty } = require('./Controllers/properties');
const { addFinancialPlansCategory, editFinancialPlansCategory, activateDeactivateFinancialPlansCategory, fetchFinancialPlansCategories, fetchFinancialPlansAddEditData, addFinancialPlan, editFinancialPlan, activateDeactivateFinancialPlan, fetchFinancialPlans, showFinancialPlans, addFinancialPlanAddon, editFinancialPlanAddon, activateDeactivateFinancialPlanAddon, fetchFinancialPlansAddons, fetchFinancialPlansAddonsAddEditData, addFinancialPlanPricing, editFinancialPlanPricing, activateDeactivateFinancialPlanPricing, fetchFinancialPlansPricings, showFinancialPlan } = require('./Controllers/financialPlans');
const { addSchedule, fetchSchedules, fetchSlots, activateDeactivateSchedule, activateDeactivateSlot, deleteSchedule, showSlots } = require('./Controllers/schedules');
const { addFilter, editFilter, fetchFilters, activateDeactivateFilter, fetchFiltersAddEditData, showFilters } = require('./Controllers/filters');
const { addTestimonial, editTestimonial, activateDeactivateTestimonial, fetchTestimonials, showTestimonials } = require('./Controllers/testimonials');
const { addFaq, editFaq, activateDeactivateFaq, fetchFaqs, showFaqs, showFinancialPlanFaqs } = require('./Controllers/faqs');
const { bookAppointment, editAppointment, completeAppointment, fetchAppointments } = require('./Controllers/appointments');
const { enquireNow, fetchEnquiries } = require('./Controllers/enquiries');
const { addCase } = require('./Controllers/cases');

const { checkUserSession } = require('./Controllers/middlewares');
const { test } = require('./Controllers/test');

const { uploadDocs, uploadImages } = require('./Utils/fileUpload');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

app.use(express.static('public'));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.post('/payment', addCase)

app.post('/v1/api/stripeWebhook/:id', (req, res) => {
    console.log(req.params.id)
    console.log(req.body)
})



// USERS ROUTES

app.post('/v1/api/users/signup',
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('password').trim().isLength({ min: 8 }).withMessage('Invalid password'),
    userSignup);

app.post('/v1/api/users/login',
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Invalid password'),
    userLogin);

app.post('/v1/api/users/forgotPassword',
    body('email').trim().isEmail().withMessage('Invalid email'),
    userForgotPassword);

app.patch('/v1/api/users/userVerification',
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('key').trim().not().isEmpty().withMessage('Invalid access key'),
    userVerification)

app.post('/v1/api/users/sendUserVerificationMail',
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    sendUserVerificationMail)

app.patch('/v1/api/users/resetPassword',
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Invalid password'),
    userResetPassword);

app.post('/v1/api/users/fetchUserDetails', checkUserSession, fetchUserDetails);

app.post('/v1/api/users/fetchUsers', checkUserSession, fetchUsers);

app.patch('/v1/api/users/activateDeactivateUser/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    activateDeactivateUser);

app.patch('/v1/api/users/changePassword', checkUserSession,
    body('old_password').trim().trim().isLength({ min: 8 }).withMessage('request type is required'),
    body('password').trim().trim().isLength({ min: 8 }).withMessage('request type is required'),
    userChangePassword
);

app.post('/v1/api/users/logout', checkUserSession, userLogout);

app.post('/v1/api/users/addDocs', checkUserSession, uploadDocs.single('doc'), addUserDocs);

app.delete('/v1/api/users/deleteDoc/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    deleteUserDoc);

app.post('/v1/api/users/fetchDocs', checkUserSession, fetchUserDocs);






// ADMIN ROUTES

app.post('/v1/api/admins/dashboard', checkUserSession, dashboard);

app.post('/v1/api/admins/login',
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Invalid password'),
    adminLogin);

app.post('/v1/api/admins/forgotPassword',
    body('email').trim().isEmail().withMessage('Invalid email'),
    adminForgotPassword);

app.patch('/v1/api/admins/resetPassword',
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Invalid password'),
    adminResetPassword);

app.post('/v1/api/admins/fetchAdminDetails', checkUserSession, fetchAdminDetails);

app.patch('/v1/api/admins/changePassword', checkUserSession,
    body('old_password').trim().trim().isLength({ min: 8 }).withMessage('request type is required'),
    body('password').trim().trim().isLength({ min: 8 }).withMessage('request type is required'),
    adminChangePassword
);

app.post('/v1/api/admins/logout', checkUserSession, adminLogout);

app.post('/v1/api/admins/addAdmin', checkUserSession,
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('service_ids').trim().not().isEmpty().withMessage('service id is required'),
    addAdmin);

app.post('/v1/api/admins/addSuperAdmin', checkUserSession,
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    addSuperAdmin);

app.put('/v1/api/admins/editAdmin', checkUserSession, uploadImages.single('image'),
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    editAdmin);

app.put('/v1/api/admins/editAdmin/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    editAdminById);


app.patch('/v1/api/admins/activateDeactivateAdmin/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    activateDeactivateAdmin);

app.post('/v1/api/admins/fetchAdmins', checkUserSession, fetchAdmins);

app.post('/v1/api/admins/fetchSuperAdmins', checkUserSession, fetchSuperAdmins);




// SERVICE PROVIDER ROUTES

app.post('/v1/api/serviceProvider/login',
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Invalid password'),
    serviceProviderLogin);

app.post('/v1/api/serviceProvider/forgotPassword',
    body('email').trim().isEmail().withMessage('Invalid email'),
    serviceProviderForgotPassword);

app.patch('/v1/api/serviceProvider/resetPassword',
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Invalid password'),
    serviceProviderResetPassword);


app.put('/v1/api/serviceProvider/editServiceProvider', checkUserSession, uploadImages.single('image'),
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    editServiceProvider);

app.patch('/v1/api/serviceProvider/changePassword', checkUserSession,
    body('old_password').trim().trim().isLength({ min: 8 }).withMessage('request type is required'),
    body('password').trim().trim().isLength({ min: 8 }).withMessage('request type is required'),
    serviceProviderChangePassword
);

app.post('/v1/api/serviceProvider/logout', checkUserSession, serviceProviderLogout);

app.post('/v1/api/serviceProvider/fetchServiceProviderDetails', checkUserSession, fetchServiceProviderDetails);

app.post('/v1/api/serviceProvider/addServiceProvider', checkUserSession,
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    addServiceProvider)

app.put('/v1/api/serviceProvider/editServiceProvider/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    editServiceProviderById)

app.patch('/v1/api/serviceProvider/activateDeactivateServiceProvider/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('Request type is required'),
    activateDeactivateServiceProvider)

app.patch('/v1/api/serviceProvider/serviceProviderVerification',
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('key').trim().not().isEmpty().withMessage('Invalid access key'),
    body('password').trim().not().isEmpty().withMessage('Password is required'),
    serviceProviderVerification)

app.post('/v1/api/serviceProvider/sendServiceProviderVerificationMail',
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    sendServiceProviderVerificationMail)

app.post('/v1/api/serviceProvider/fetchServiceProviders', checkUserSession, fetchServiceProviders);




// PROPERTY TYPES ROUTES

app.post('/v1/api/propertyTypes/addPropertyType', checkUserSession,
    body('name').trim().not().isEmpty().withMessage('name is required'),
    addPropertyType);

app.put('/v1/api/propertyTypes/editPropertyType/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('name').trim().not().isEmpty().withMessage('name is required'),
    editPropertyType);

app.patch('/v1/api/propertyTypes/activateDeactivatePropertyType/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    activateDeactivatePropertyType);

app.post('/v1/api/propertyTypes/fetchPropertyTypes', checkUserSession, fetchPropertyTypes);

app.post('/v1/api/propertyTypes/fetchActivePropertyTypes', checkUserSession, fetchActivePropertyTypes);





// PROPERTY SERVICES ROUTES

app.post('/v1/api/propertyServices/addPropertyService', checkUserSession, uploadImages.single('icon'),
    body('name').trim().not().isEmpty().withMessage('name is required'),
    addPropertyService);

app.put('/v1/api/propertyServices/editPropertyService/:id', checkUserSession, uploadImages.single('icon'),
    param('id').exists().withMessage('id is required'),
    body('name').trim().not().isEmpty().withMessage('name is required'),
    editPropertyService);

app.patch('/v1/api/propertyServices/activateDeactivatePropertyService/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    activateDeactivatePropertyService);

app.post('/v1/api/propertyServices/fetchPropertyServices', checkUserSession, fetchPropertyServices);





// BUILDER ROUTES

app.post('/v1/api/builder/addBuilder', checkUserSession, uploadImages.single('image'),
    body('display_name').trim().not().isEmpty().withMessage('Display Name is required'),
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('address').trim().not().isEmpty().withMessage('Address is required'),
    body('city').trim().not().isEmpty().withMessage('City is required'),
    body('state').trim().not().isEmpty().withMessage('State is required'),
    body('country').trim().not().isEmpty().withMessage('Country is required'),
    body('zipcode').trim().not().isEmpty().withMessage('Zipcode is required'),
    addBuilder);

app.put('/v1/api/builder/editBuilder/:id', checkUserSession, uploadImages.single('image'),
    param('id').exists().withMessage('id is required'),
    body('display_name').trim().not().isEmpty().withMessage('Display Name is required'),
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('address').trim().not().isEmpty().withMessage('Address is required'),
    body('city').trim().not().isEmpty().withMessage('City is required'),
    body('state').trim().not().isEmpty().withMessage('State is required'),
    body('country').trim().not().isEmpty().withMessage('Country is required'),
    body('zipcode').trim().not().isEmpty().withMessage('Zipcode is required'),
    editBuilder);

app.patch('/v1/api/builder/activateDeactivateBuilder/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    activateDeactivateBuilder);

app.post('/v1/api/builder/fetchBuilders', checkUserSession, fetchBuilders);





// PROPERTIES ROUTES

app.post('/v1/api/property/addProperty', checkUserSession, uploadImages.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 15 }]),
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    body('location_url').trim().not().isEmpty().withMessage('location is required'),
    body('description').trim().not().isEmpty().withMessage('Description is required'),
    body('contact_email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('contact_number').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('address').trim().not().isEmpty().withMessage('Address is required'),
    body('city').trim().not().isEmpty().withMessage('City is required'),
    body('state').trim().not().isEmpty().withMessage('State is required'),
    body('country').trim().not().isEmpty().withMessage('Country is required'),
    body('zipcode').trim().not().isEmpty().withMessage('Zipcode is required'),
    body('price').trim().not().isEmpty().withMessage('price is required'),
    body('property_type').trim().not().isEmpty().withMessage('Property Type is required'),
    body('services_available').trim().not().isEmpty().withMessage('services available is required'),
    addProperty);


app.put('/v1/api/property/editProperty/:id', checkUserSession, uploadImages.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'new_images', maxCount: 15 }]),
    param('id').exists().withMessage('id is required'),
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    body('description').trim().not().isEmpty().withMessage('Description is required'),
    body('contact_email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('contact_number').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('address').trim().not().isEmpty().withMessage('Address is required'),
    body('city').trim().not().isEmpty().withMessage('City is required'),
    body('state').trim().not().isEmpty().withMessage('State is required'),
    body('country').trim().not().isEmpty().withMessage('Country is required'),
    body('zipcode').trim().not().isEmpty().withMessage('Zipcode is required'),
    body('price').trim().not().isEmpty().withMessage('price is required'),
    body('area').trim().not().isEmpty().withMessage('area is required'),
    body('property_type').trim().not().isEmpty().withMessage('Property Type is required'),
    editProperty);

app.post('/v1/api/property/fetchPropertyAddEditData', checkUserSession, fetchPropertyAddEditData);

app.post('/v1/api/property/fetchProperties', checkUserSession, fetchProperties);

app.post('/v1/api/property/fetchProperty/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    fetchPropertyById);

app.patch('/v1/api/property/activateDeactivateProperty/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    activateDeactivateProperty);

app.patch('/v1/api/property/propertyApproval/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    propertyApproval);

app.patch('/v1/api/property/setTopProperty/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    setTopProperty);

app.post('/v1/api/users/showProperties', showProperties)

app.post('/v1/api/users/showTopProperties', showTopProperties)

app.post('/v1/api/users/showProperty/:id',
    param('id').exists().withMessage('id is required'),
    showProperty)

app.post('/v1/api/users/fetchPropertiesSearchData', fetchPropertiesSearchData);


app.post('/v1/api/users/viewedProperty/:id',
    param('id').exists().withMessage('id is required'),
    viewedProperty);





// FINANCIAL PLANS ROUTES

app.post('/v1/api/financialPlans/addFinancialPlansCategory', checkUserSession,
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    addFinancialPlansCategory)

app.put('/v1/api/financialPlans/editFinancialPlansCategory/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    editFinancialPlansCategory)

app.patch('/v1/api/financialPlans/activateDeactivateFinancialPlansCategory/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('Request Type is required'),
    activateDeactivateFinancialPlansCategory)

app.post('/v1/api/financialPlans/fetchFinancialPlansCategories', checkUserSession, fetchFinancialPlansCategories);

app.post('/v1/api/financialPlans/fetchFinancialPlansAddEditData', checkUserSession, fetchFinancialPlansAddEditData);

app.post('/v1/api/financialPlans/addFinancialPlan', checkUserSession,
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    body('description').trim().not().isEmpty().withMessage('Description is required'),
    body('benefits').trim().not().isEmpty().withMessage('Benefits is required'),
    body('price').trim().not().isEmpty().withMessage('Price is required'),
    body('docs').trim().not().isEmpty().withMessage('docs is required'),
    body('category_id').trim().not().isEmpty().withMessage('category id is required'),
    addFinancialPlan)

app.put('/v1/api/financialPlans/editFinancialPlan/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    body('description').trim().not().isEmpty().withMessage('Description is required'),
    body('benefits').trim().not().isEmpty().withMessage('Benefits is required'),
    body('price').trim().not().isEmpty().withMessage('Price is required'),
    body('docs').trim().not().isEmpty().withMessage('docs is required'),
    body('category_id').trim().not().isEmpty().withMessage('category id is required'),
    editFinancialPlan)

app.patch('/v1/api/financialPlans/activateDeactivateFinancialPlan/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('Request Type is required'),
    activateDeactivateFinancialPlan);

app.post('/v1/api/financialPlans/fetchFinancialPlans', checkUserSession, fetchFinancialPlans);

app.post('/v1/api/financialPlans/fetchFinancialPlansAddonsAddEditData', checkUserSession, fetchFinancialPlansAddonsAddEditData);

app.post('/v1/api/financialPlans/addFinancialPlanAddon', checkUserSession,
    body('description').trim().not().isEmpty().withMessage('Description is required'),
    body('price').trim().not().isEmpty().withMessage('Price is required'),
    body('plan_id').trim().not().isEmpty().withMessage('plan id is required'),
    addFinancialPlanAddon)

app.put('/v1/api/financialPlans/editFinancialPlanAddon/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('description').trim().not().isEmpty().withMessage('Description is required'),
    body('price').trim().not().isEmpty().withMessage('Price is required'),
    body('plan_id').trim().not().isEmpty().withMessage('plan id is required'),
    editFinancialPlanAddon)

app.patch('/v1/api/financialPlans/activateDeactivateFinancialPlanAddon/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('Request Type is required'),
    activateDeactivateFinancialPlanAddon);

app.post('/v1/api/financialPlans/fetchFinancialPlansAddons', checkUserSession, fetchFinancialPlansAddons);

app.post('/v1/api/financialPlans/addFinancialPlanPricing', checkUserSession,
    body('name').trim().not().isEmpty().withMessage('name is required'),
    body('price').trim().not().isEmpty().withMessage('Price is required'),
    body('plan_id').trim().not().isEmpty().withMessage('plan id is required'),
    addFinancialPlanPricing)

app.put('/v1/api/financialPlans/editFinancialPlanPricing/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('name').trim().not().isEmpty().withMessage('name is required'),
    body('price').trim().not().isEmpty().withMessage('Price is required'),
    body('plan_id').trim().not().isEmpty().withMessage('plan id is required'),
    editFinancialPlanPricing)

app.patch('/v1/api/financialPlans/activateDeactivateFinancialPlanPricing/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('Request Type is required'),
    activateDeactivateFinancialPlanPricing);

app.post('/v1/api/financialPlans/fetchFinancialPlansPricings', checkUserSession, fetchFinancialPlansPricings);

app.post('/v1/api/users/showFinancialPlans', showFinancialPlans)

app.post('/v1/api/users/showFinancialPlan/:id',
    param('id').exists().withMessage('id is required'),
    showFinancialPlan)






// SCHEDULE ROUTES

app.post('/v1/api/schedules/addSchedule', checkUserSession,
    body('day').trim().not().isEmpty().withMessage('Day is required'),
    body('start_time').trim().not().isEmpty().withMessage('start time is required'),
    body('end_time').trim().not().isEmpty().withMessage('end time id is required'),
    addSchedule)

app.post('/v1/api/schedules/fetchSchedules', checkUserSession,
    fetchSchedules)

app.post('/v1/api/schedules/fetchSlots/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    fetchSlots)

app.patch('/v1/api/schedules/activateDeactivateSchedule/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('Request Type is required'),
    activateDeactivateSchedule);

app.patch('/v1/api/schedules/deleteSchedule/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    deleteSchedule);

app.patch('/v1/api/schedules/activateDeactivateSlot/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('Request Type is required'),
    activateDeactivateSlot);

app.post('/v1/api/schedules/showSlots',
    body('date').trim().not().isEmpty().withMessage('date is required'),
    body('time_type').trim().not().isEmpty().withMessage('Time Type is required'),
    showSlots)






// FILTER ROUTES 

app.post('/v1/api/filters/addFilter', checkUserSession,
    body('name').trim().not().isEmpty().withMessage('name is required'),
    body('type').trim().not().isEmpty().withMessage('type is required'),
    body('category_id').trim().not().isEmpty().withMessage('category is required'),
    addFilter)

app.put('/v1/api/filters/editFilter/:id', checkUserSession,
    body('name').trim().not().isEmpty().withMessage('name is required'),
    editFilter)

app.patch('/v1/api/filters/activateDeactivateFilter/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('Request Type is required'),
    activateDeactivateFilter);

app.post('/v1/api/filters/fetchFilters', checkUserSession, fetchFilters);

app.post('/v1/api/filters/fetchFiltersAddEditData', checkUserSession, fetchFiltersAddEditData);

app.post('/v1/api/users/showFilters', showFilters)




// TESTIMONIALS ROUTES

app.post('/v1/api/testimonials/addTestimonial', checkUserSession, uploadImages.single('image'),
    body('name').trim().not().isEmpty().withMessage('name is required'),
    body('comment').trim().not().isEmpty().withMessage('comment is required'),
    addTestimonial);

app.put('/v1/api/testimonials/editTestimonial/:id', checkUserSession, uploadImages.single('image'),
    param('id').exists().withMessage('id is required'),
    body('name').trim().not().isEmpty().withMessage('name is required'),
    body('comment').trim().not().isEmpty().withMessage('comment is required'),
    editTestimonial);

app.patch('/v1/api/testimonials/activateDeactivateTestimonial/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    activateDeactivateTestimonial);

app.post('/v1/api/testimonials/fetchTestimonials', checkUserSession, fetchTestimonials);

app.post('/v1/api/users/showTestimonials', showTestimonials);






// FAQS ROUTES

app.post('/v1/api/faqs/addFaq', checkUserSession,
    body('question').trim().not().isEmpty().withMessage('question is required'),
    body('answer').trim().not().isEmpty().withMessage('answer is required'),
    body('service_id').trim().not().isEmpty().withMessage('service_id is required'),
    addFaq);

app.put('/v1/api/faqs/editFaq/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('question').trim().not().isEmpty().withMessage('question is required'),
    body('answer').trim().not().isEmpty().withMessage('answer is required'),
    body('service_id').trim().not().isEmpty().withMessage('service_id is required'),
    editFaq);

app.patch('/v1/api/faqs/activateDeactivateFaq/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    body('request_type').trim().not().isEmpty().withMessage('request type is required'),
    activateDeactivateFaq);

app.post('/v1/api/faqs/fetchFaqs', checkUserSession, fetchFaqs);

app.post('/v1/api/users/showFaqs/:id',
    param('id').exists().withMessage('id is required'),
    showFaqs);

app.post('/v1/api/users/showFinancialPlanFaqs/:id',
    param('id').exists().withMessage('id is required'),
    showFinancialPlanFaqs);






// APPOINTMENTS ROUTES


app.post('/v1/api/users/bookAppointment',
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('query').trim().not().isEmpty().withMessage('query is required'),
    body('slot_id').trim().not().isEmpty().withMessage('slot id is required'),
    body('service_id').trim().not().isEmpty().withMessage('service id is required'),
    bookAppointment);

app.put('/v1/api/users/editAppointment/:id',
    param('id').exists().withMessage('id is required'),
    body('first_name').trim().not().isEmpty().withMessage('First Name is required'),
    body('last_name').trim().not().isEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('query').trim().not().isEmpty().withMessage('query is required'),
    body('slot_id').trim().not().isEmpty().withMessage('slot id is required'),
    body('service_id').trim().not().isEmpty().withMessage('service id is required'),
    editAppointment);

app.patch('/v1/api/users/completeAppointment/:id', checkUserSession,
    param('id').exists().withMessage('id is required'),
    completeAppointment);

app.post('/v1/api/admins/fetchAppointments', checkUserSession, fetchAppointments);





// ENQUIREIES ROUTES

app.post('/v1/api/users/enquireNow',
    body('email').trim().isEmail().not().isEmpty().withMessage('Invalid email'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Invalid phone'),
    body('property_id').trim().not().isEmpty().withMessage('property id is required'),
    enquireNow)

app.post('/v1/api/enquiries/fetchEnquiries', checkUserSession, fetchEnquiries)


app.post('/test', test)

app.post('/aws', (req, res) => {
    const sesConfig = {
        apiVersion: '2010-12-01',
        accessKeyId: 'AKIAWWBGVYDD4HAUI25I',
        secretAccessKey: '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',
        region: 'ap-south-1'
    }

    const params = {
        Source: 'ravi.soni@techconfer.in',
        Destination: {
            ToAddresses: [
                'abhishek.verma@techconfer.in'
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: "HTML_FORMAT_BODY"
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Test email'
            }
        }
    }

    new aws.SES(sesConfig).sendEmail(params).promise().then(result => console.log(result)).catch(err => console.log(err))
})





const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`server started`);
})