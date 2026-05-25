
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { useAuth } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Building2, Mail, Lock, LogIn, Loader2, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/')
      }
    })
  }, [auth, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName) {
          await updateProfile(userCredential.user, { displayName })
        }
        toast({
          title: "تم إنشاء الحساب",
          description: "مرحباً بك في مدى إنماء!",
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push('/')
    } catch (error: any) {
      let message = "حدث خطأ أثناء العملية."
      if (error.code === 'auth/email-already-in-use') message = "البريد الإلكتروني مستخدم بالفعل. حاول تسجيل الدخول."
      if (error.code === 'auth/weak-password') message = "كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل."
      if (error.code === 'auth/invalid-credential') message = "بيانات الدخول غير صحيحة."
      if (error.code === 'auth/user-not-found') message = "لم يتم العثور على حساب بهذا البريد."
      if (error.code === 'auth/wrong-password') message = "كلمة المرور غير صحيحة."
      
      toast({
        variant: "destructive",
        title: "فشل العملية",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      router.push('/')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: "فشل تسجيل الدخول عبر جوجل.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-primary size-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-6">
            <Building2 className="size-10" />
          </div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-slate-900">مدى إنماء</h1>
          <p className="text-slate-500 mt-2">نظام إدارة العقارات المتطور</p>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-headline">
              {isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </CardTitle>
            <CardDescription>
              {isRegistering ? 'قم بتعبئة البيانات للبدء في إدارة عقاراتك' : 'أدخل بياناتك للوصول إلى لوحة التحكم'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <div className="relative">
                    <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="أدخل اسمك" 
                      className="pr-10"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pr-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 gap-2 rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="size-5 animate-spin" /> : isRegistering ? <UserPlus className="size-5" /> : <LogIn className="size-5" />}
                {isRegistering ? 'إنشاء الحساب' : 'دخول'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">أو عبر</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12 gap-2 rounded-xl" onClick={handleGoogleLogin} disabled={loading}>
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                />
              </svg>
              سجل دخولك بجوجل
            </Button>
          </CardContent>
          <CardFooter className="bg-slate-50/50 p-6 flex flex-col gap-2">
            <Button 
              variant="link" 
              className="text-primary w-full" 
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
            </Button>
            <p className="text-[10px] text-muted-foreground w-full text-center">بالمتابعة، أنت توافق على شروط الخدمة</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
