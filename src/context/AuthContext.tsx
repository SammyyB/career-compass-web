import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import {
  requireSupabaseConfiguration,
  supabase,
  supabaseConfigured,
} from "../lib/supabase";
import type { Profile, Role } from "../lib/types";
import { getProfile } from "../services/repository";

export type StudentRegistration = {
  email: string;
};

export type StudentProfileDetails = {
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  studentId?: string;
  academicYear?: string;
  program?: string;
  interests?: string[];
  technologies?: string[];
};

export type PasswordRegistration = StudentProfileDetails & {
  email: string;
  password: string;
};

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  role: Role | null;
  isLoggedIn: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Profile>;
  signUpStudent: (data: PasswordRegistration) => Promise<boolean>;
  beginStudentRegistration: (data: StudentRegistration) => Promise<boolean>;
  resendSignupConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  requestEmailChange: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

type AuthEmailOtpType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email";

const AuthContext = createContext<AuthContextType | null>(null);
export const PROFILE_SETUP_PENDING_KEY = "career-compass:profile-setup-pending";

export function isStudentProfileComplete(profile: Profile | null | undefined) {
  return Boolean(
    profile?.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.student_id?.trim() &&
      profile.program?.trim() &&
      profile.career_target?.trim() &&
      profile.interests?.length &&
      profile.technologies?.length
  );
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password)
  );
}

export function getPasswordRuleMessage() {
  return "Password must be at least 8 characters and include one uppercase letter, one number, and one special character.";
}

function getRedirectUrl(flow: "signup" | "reset" | "email_change") {
  // Do not put a HashRouter route here. Supabase places recovery tokens in the
  // URL hash, and two hash fragments prevent Supabase from restoring the session.
  const redirectUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  redirectUrl.searchParams.set("auth_flow", flow);
  return redirectUrl.toString();
}

function metadataFromDetails(details: StudentProfileDetails) {
  return {
    ...(details.username ? { username: details.username.trim() } : {}),
    ...(details.firstName ? { first_name: details.firstName.trim() } : {}),
    ...(details.middleName ? { middle_name: details.middleName.trim() } : {}),
    ...(details.lastName ? { last_name: details.lastName.trim() } : {}),
    ...(details.studentId
      ? { student_id: details.studentId.trim().toUpperCase() }
      : {}),
    ...(details.academicYear ? { academic_year: details.academicYear } : {}),
    ...(details.program ? { program: details.program.trim() } : {}),
    ...(details.interests ? { interests: details.interests } : {}),
    ...(details.technologies ? { technologies: details.technologies } : {}),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      setProfile(await getProfile(userId));
    } catch (error) {
      console.error("Unable to load user profile:", getAuthErrorMessage(error));
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    let handledAuthFlow = false;

    const routeToPasswordForm = (hasSession: boolean) => {
      if (!hasSession || handledAuthFlow) return;

      const authFlow = new URLSearchParams(window.location.search).get(
        "auth_flow"
      );

      if (
        authFlow !== "signup" &&
        authFlow !== "reset" &&
        authFlow !== "email_change"
      ) return;

      handledAuthFlow = true;
      const appBase = new URL(import.meta.env.BASE_URL, window.location.origin);
      window.history.replaceState(null, "", appBase.toString());
      window.location.hash = authFlow === "email_change"
        ? "/profile?email=confirmed"
        : `/update-password?flow=${authFlow}`;
    };

    const initialize = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const callbackTokenHash = queryParams.get("token_hash");
      const callbackOtpType = queryParams.get("type");
      const callbackParams = new URLSearchParams(
        window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash
      );
      const callbackAccessToken = callbackParams.get("access_token");
      const callbackRefreshToken = callbackParams.get("refresh_token");

      let data: { session: Session | null };
      let error: Error | null = null;

      // Custom Supabase email templates can return a token hash to the app.
      // Verify it here so recovery does not depend on a browser preserving the
      // access-token fragment from Supabase's hosted confirmation URL.
      const validOtpTypes: AuthEmailOtpType[] = [
        "signup",
        "invite",
        "magiclink",
        "recovery",
        "email_change",
        "email",
      ];
      if (
        callbackTokenHash &&
        callbackOtpType &&
        validOtpTypes.includes(callbackOtpType as AuthEmailOtpType)
      ) {
        const verified = await supabase.auth.verifyOtp({
          token_hash: callbackTokenHash,
          type: callbackOtpType as AuthEmailOtpType,
        });
        data = verified.data;
        error = verified.error;
      } else {
        const current = await supabase.auth.getSession();
        data = current.data;
        error = current.error;
      }

      // Restore the implicit-flow session from Supabase's confirmation URL
      // before replacing its hash with a HashRouter route.
      if (
        !data.session &&
        callbackAccessToken &&
        callbackRefreshToken
      ) {
        const restored = await supabase.auth.setSession({
          access_token: callbackAccessToken,
          refresh_token: callbackRefreshToken,
        });

        if (!restored.error) {
          data = { ...data, session: restored.data.session };
          error = null;
        } else {
          error = restored.error;
        }
      }

      if (!mounted) return;
      if (error) console.error(error.message);

      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
      routeToPasswordForm(Boolean(data.session));
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: unknown, nextSession: Session | null) => {
      setSession(nextSession);

      // Supabase may restore the confirmation session after getSession() has
      // returned. Handle the auth event too so signup/reset links still reach
      // the password form instead of leaving the user at the landing page.
      routeToPasswordForm(Boolean(nextSession));

      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    requireSupabaseConfiguration();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("No user account was returned.");

    const nextProfile = await getProfile(data.user.id);

    if (!nextProfile) {
      await supabase.auth.signOut();
      throw new Error(
        "Your account profile is not ready yet. Please complete your profile."
      );
    }

    setSession(data.session);
    setProfile(nextProfile);
    return nextProfile;
  };

  const createStudentAccount = async (
    data: PasswordRegistration,
    flow: "signup" | "reset" = "signup"
  ) => {
    requireSupabaseConfiguration();

    if (!isStrongPassword(data.password)) {
      throw new Error(getPasswordRuleMessage());
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: metadataFromDetails(data),
        emailRedirectTo: getRedirectUrl(flow),
      },
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error("The account could not be created.");

    if (authData.session) {
      const nextProfile = await getProfile(authData.user.id);
      setSession(authData.session);
      setProfile(nextProfile);
    }

    return !authData.session;
  };

  // Kept for compatibility with older registration code.
  // It no longer checks an administrator-approved Student ID.
  const signUpStudent = async (data: PasswordRegistration) =>
    createStudentAccount(data);

  const beginStudentRegistration = async (data: StudentRegistration) => {
    const temporaryPassword = `Cc!${crypto.randomUUID()}Aa9`;

    return createStudentAccount({
      email: data.email,
      password: temporaryPassword,
    });
  };

  const resendSignupConfirmation = async (email: string) => {
    requireSupabaseConfiguration();

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      throw new Error("Enter a valid email address.");
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: { emailRedirectTo: getRedirectUrl("signup") },
    });

    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    if (supabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const requestPasswordReset = async (email: string) => {
    requireSupabaseConfiguration();

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: getRedirectUrl("reset") }
    );

    if (error) throw new Error(error.message);
  };

  const requestEmailChange = async (email: string) => {
    requireSupabaseConfiguration();

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      throw new Error("Enter a valid email address.");
    }

    const { error } = await supabase.auth.updateUser(
      { email: normalizedEmail },
      { emailRedirectTo: getRedirectUrl("email_change") }
    );

    if (error) throw new Error(error.message);
  };

  const updatePassword = async (password: string) => {
    requireSupabaseConfiguration();

    if (!session) {
      throw new Error(
        "This secure link is no longer active. Request a new password link and open it in this browser."
      );
    }

    if (!isStrongPassword(password)) {
      throw new Error(getPasswordRuleMessage());
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw new Error(error.message);
  };

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      profile,
      role: profile?.role ?? null,
      isLoggedIn: Boolean(session),
      loading,
      signIn,
      signUpStudent,
      beginStudentRegistration,
      resendSignupConfirmation,
      signOut,
      requestPasswordReset,
      requestEmailChange,
      updatePassword,
      refreshProfile,
    }),
    [loading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}