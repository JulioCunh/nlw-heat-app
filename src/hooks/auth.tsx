import React, { createContext, useContext, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { api } from '../services/api';

const CLIENT_ID = '6c4880599ec881bf4cd6';
const SCOPE = 'read:user';

type User = {
  id: string;
  avatar_url: string;
  name: string;
  login: string;
};

type AuthContextData = {
  user: User | null;
  isSigninIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthResponse = {
  token: string;
  user: User;
};

type AuthorizationResponse = {
  params: {
    code?: string;
  };
};

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

function AuthProvider({ children }: AuthProviderProps) {
  const [isSigninIn, setIsSigninIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  async function signIn() {
    setIsSigninIn(true);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`;
    const { params } = (await AuthSession.startAsync({
      authUrl,
    })) as AuthorizationResponse;

    if (params && params.code) {
      const authResponse = await api.post('/authorizations', {
        code: params.code,
      });
      const { user, token } = authResponse.data as AuthResponse;

      console.log(authResponse.data);
    }

    setIsSigninIn(false);
  }

  async function signOut() {}

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isSigninIn }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
