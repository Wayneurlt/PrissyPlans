declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    role: 'OWNER' | 'ADMIN'
  }

  interface UserSession {
    loggedInAt: number
  }
}

export {}
