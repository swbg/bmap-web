import React, { ReactNode, useState } from "react";
import Favicon from "/favicon.svg";

type PasswordGateProps = {
  correctPassword: string;
  children: ReactNode;
};
// Add simplest possible authentication functionality
const PasswordGate: React.FC<PasswordGateProps> = ({ correctPassword, children }) => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="passwordContainer">
      <form className="passwordCard" onSubmit={handleSubmit}>
        <h2>
          Kurze Durststrecke <img src={Favicon} width="10%" />
        </h2>{" "}
        <input
          type="password"
          value={enteredPassword}
          onChange={(e) => setEnteredPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
};

export default PasswordGate;
