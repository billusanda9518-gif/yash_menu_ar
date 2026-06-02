import type { Metadata } from "next";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your ARMenu account and start building AR menus for your restaurant.",
};

export default function SignupPage() {
  return <SignupForm />;
}
