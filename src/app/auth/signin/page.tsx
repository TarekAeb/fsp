import type { FC } from "react";
import { SignInForm } from "@/components/auth/login-form";

interface LoginPageProps {}

const LoginPage: FC<Readonly<LoginPageProps>> = ({}) => {
  return <SignInForm />;
};

export default LoginPage;
