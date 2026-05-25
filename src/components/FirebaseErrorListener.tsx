
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ في الأذونات',
        description: `لا تملك الصلاحية لتنفيذ هذه العملية على: ${error.context.path}`,
      });
      // In a real dev environment, this would throw to show the Next.js error overlay
      // throw error; 
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
