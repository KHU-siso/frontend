// Presentation flag only. Disabling notices does not enable authentication.
// Replace the login/signup/OAuth/recovery handlers when connecting a real API;
// unsupported-action feedback stays visible until those handlers are replaced.
export default function AuthDemoNotice({ children }) {
  return import.meta.env.VITE_SHOW_AUTH_DEMO_NOTICE === 'true' ? children : null
}
