import type { KeyboardEvent } from 'react';
import { z } from 'zod';
import type { ZodSafeParseResult } from 'zod';

const LETTERS_ONLY = /^[A-Za-z\s]+$/;
const BLOCKED_NUMBER_KEYS = ['e', 'E', '+', '-'];

export const nameSchema = z
    .string()
    .trim()
    .min(1, 'This field is required.')
    .max(80, 'Use 80 characters or fewer.')
    .regex(LETTERS_ONLY, 'Use letters and spaces only.');

export const requiredString = (label: string) =>
    z.string().trim().min(1, `${label} is required.`);

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Password must include a lowercase letter.')
    .regex(/[A-Z]/, 'Password must include an uppercase letter.')
    .regex(/[0-9]/, 'Password must include a number.')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character.');

export const registerSchema = z
    .object({
        username: requiredString('Username').max(
            255,
            'Username must be 255 characters or fewer.',
        ),
        email: z
            .string()
            .trim()
            .min(1, 'Email is required.')
            .email('Enter a valid email address.'),
        password: passwordSchema,
        password_confirmation: requiredString('Password confirmation'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match.',
        path: ['password_confirmation'],
    });

export const aboutYouSchema = z.object({
    first_name: nameSchema,
    last_name: nameSchema,
    phone_number: requiredString('Phone number'),
    address: requiredString('Address'),
    date_of_birth: requiredString('Date of birth'),
    nationality: requiredString('Nationality'),
});

export const identitySchema = z.object({
    id_type: requiredString('ID type'),
    id_number: requiredString('ID number'),
    issue_date: requiredString('Issue date'),
    expiry_date: requiredString('Expiry date'),
    image_file: z.unknown().optional(),
    image_preview: z.unknown().refine(Boolean, 'ID photo is required.'),
});

export const referenceSchema = z.object({
    first_name: nameSchema,
    last_name: nameSchema,
    phone_number: requiredString('Phone number'),
    address: requiredString('Address'),
    relationship: requiredString('Relationship'),
});

export const referencesSchema = z
    .array(referenceSchema)
    .min(3, 'At least 3 references are required.');

export type FormErrors<T extends string = string> = Partial<Record<T, string>>;

export function zodErrors<T extends string>(
    result: ZodSafeParseResult<unknown>,
): FormErrors<T> {
    if (result.success) {
        return {};
    }

    return result.error.issues.reduce<FormErrors<T>>((errors, issue) => {
        const key = issue.path.join('.') as T;

        if (!errors[key]) {
            errors[key] = issue.message;
        }

        return errors;
    }, {});
}

export function preventInvalidNumberKey(event: KeyboardEvent<HTMLInputElement>) {
    if (BLOCKED_NUMBER_KEYS.includes(event.key)) {
        event.preventDefault();
    }
}

export function sanitizeDecimalInput(value: string): string {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const [whole, ...decimal] = cleaned.split('.');

    return decimal.length > 0 ? `${whole}.${decimal.join('')}` : whole;
}

export function sanitizeNameInput(value: string): string {
    return value.replace(/[^A-Za-z\s]/g, '');
}
