import ApiError from "../utils/ApiError.js";



/** Checks if the logged-in user has the 'admin' role. */
const checkIsAdmin = (loggedInUser) => {
    return loggedInUser?.role === 'admin';
};

/** Checks if the logged-in user has the 'manager' role. */
const checkIsManager = (loggedInUser) => {
    return loggedInUser?.role === 'manager';
};

/** Checks if the logged-in user is deleting the target user's account. */
const checkIsSelf = (loggedInUser, targetId) => {
    return loggedInUser?._id?.toString() === targetId;
};

// Middleware to check if the user has 'ADMIN' role
export const isAdmin = (req, res, next) => {
    if(!req.user || !checkIsAdmin(req.user)){
        throw new ApiError(403, "Access denied. Admins privileges required.");
    }
    next();
}

// Middleware to check if the user has 'MANAGER' or 'ADMIN' role
export const isAdminOrManagerOrSelf = (req, res, next) => {
    const userIdToDelete = req.params._id || req.params.id;
    const loggedInUser = req.user;

    if(!loggedInUser){
        throw new ApiError(401, "Authentication required.");
    }

    const isAdminOrManager = checkIsAdmin(loggedInUser) || checkIsManager(loggedInUser);
    const isSelf = checkIsSelf(loggedInUser, userIdToDelete);

    if(isAdminOrManager || isSelf){
        next();
    } else {
        throw new ApiError(403, "Forbidden. You are not authorized to deactivate this account.");
    }
}