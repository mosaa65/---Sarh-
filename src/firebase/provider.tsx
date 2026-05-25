
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FirebaseContextProps {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextProps | undefined>(undefined);

export function FirebaseProvider({
  children,
  app,
  db,
  auth,
}: {
  children: ReactNode;
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}) {
  if (!app || !db || !auth) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-20">
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold text-lg mr-2">تنبيه: مشروع Firebase غير متصل</AlertTitle>
          <AlertDescription className="mt-2 text-base leading-relaxed">
            يبدو أن إعدادات Firebase مفقودة أو غير صحيحة. يرجى التأكد من ربط مشروعك عبر لوحة تحكم Firebase Studio وتحديث مفاتيح الربط في ملف الإعدادات.
          </AlertDescription>
        </Alert>
        <div className="mt-8 opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ app, db, auth }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within FirebaseProvider');
  return context;
};

export const useFirebaseApp = () => useFirebase().app!;
export const useFirestore = () => useFirebase().db!;
export const useAuth = () => useFirebase().auth!;
