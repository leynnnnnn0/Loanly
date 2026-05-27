import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { FormErrors } from '@/lib/forms/validation';
import { registerSchema, zodErrors } from '@/lib/forms/validation';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [clientErrors, setClientErrors] = useState<
        FormErrors<keyof typeof data>
    >({});

    const setField = (field: keyof typeof data, value: string) => {
        setData(field, value);
        setClientErrors((current) => ({ ...current, [field]: undefined }));
    };

    const errorFor = (field: keyof typeof data) =>
        clientErrors[field] ?? errors[field];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = registerSchema.safeParse(data);

        if (!result.success) {
            setClientErrors(zodErrors(result));

            return;
        }

        post(store.url(), {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />
            <form
                onSubmit={submit}
                className="flex flex-col gap-6"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            name="username"
                            placeholder="username"
                            value={data.username}
                            onChange={(event) =>
                                setField('username', event.target.value)
                            }
                            aria-invalid={Boolean(errorFor('username'))}
                        />
                        <InputError
                            message={errorFor('username')}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            name="email"
                            placeholder="email@example.com"
                            value={data.email}
                            onChange={(event) =>
                                setField('email', event.target.value)
                            }
                            aria-invalid={Boolean(errorFor('email'))}
                        />
                        <InputError message={errorFor('email')} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            name="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={(event) =>
                                setField('password', event.target.value)
                            }
                            aria-invalid={Boolean(errorFor('password'))}
                        />
                        <InputError message={errorFor('password')} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            name="password_confirmation"
                            placeholder="Confirm password"
                            value={data.password_confirmation}
                            onChange={(event) =>
                                setField(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            aria-invalid={Boolean(
                                errorFor('password_confirmation'),
                            )}
                        />
                        <InputError
                            message={errorFor('password_confirmation')}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        tabIndex={5}
                        data-test="register-user-button"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
