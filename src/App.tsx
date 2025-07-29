import BaseMap from "./components/BaseMap";
import PasswordGate from "./components/PasswordGate";

// Import password from environment variable, set local in .env (root)
export const PASSWORD = import.meta.env.VITE_LOGIN_PASSWORD;

export default function App() {
  return (
    <>
      <PasswordGate correctPassword={PASSWORD}>
        <div>
          <BaseMap />
        </div>
      </PasswordGate>
    </>
  );
}
