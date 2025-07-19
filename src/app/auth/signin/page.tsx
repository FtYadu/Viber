import { Suspense } from "react"
import Link from "next/link"
import { SignInForm } from "@/components/forms/signin-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SignInPageProps {
  searchParams: {
    message?: string
    error?: string
  }
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {searchParams.message && (
          <Alert>
            <AlertDescription>{searchParams.message}</AlertDescription>
          </Alert>
        )}

        {searchParams.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {searchParams.error === "CredentialsSignin"
                ? "Invalid email or password"
                : "An error occurred during sign in"}
            </AlertDescription>
          </Alert>
        )}

        <Suspense fallback={<div>Loading...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}