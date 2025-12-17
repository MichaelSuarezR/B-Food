'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    // TODO: Add Supabase Auth later
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 w-full p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 w-full p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Sign In
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
            Don’t have an account?{' '}
           <a href="/auth/register" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </main>
  )
}