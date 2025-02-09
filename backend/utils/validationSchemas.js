import * as yup from 'yup';

// User related schemas
export const userSchemas = {
    register: yup.object({
        name: yup.string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(30, 'Name must not exceed 30 characters')
            .matches(/^[a-zA-Z\s]{2,30}$/, 'Name can only contain letters and spaces'),

        email: yup.string()
            .required('Email is required')
            .email('Invalid email format'),

        password: yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            ),

        profile_image: yup.string()
            .nullable()
    }),

    login: yup.object({
        email: yup.string()
            .required('Email is required')
            .email('Invalid email format'),

        password: yup.string()
            .required('Password is required')
    })
};

// Event related schemas (for future use)
export const eventSchemas = {
    create: yup.object({
        name: yup.string()
            .required('Event name is required')
            .min(3, 'Event name must be at least 3 characters')
            .max(100, 'Event name must not exceed 100 characters'),

        description: yup.string()
            .required('Description is required')
            .min(10, 'Description must be at least 10 characters'),

        date_time: yup.date()
            .required('Event date and time is required')
            .min(new Date(), 'Event date must be in the future'),

        category: yup.string()
            .required('Category is required'),

        cover_image: yup.string()
            .nullable()
    })
}; 