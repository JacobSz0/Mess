import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToken } from "./Authentication";

function AccountSignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useToken();
  const navigate = useNavigate();




  const handleUsernameChange = (event) => {
    const value = event.target.value;
    setUsername(value);
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
  };


  const handleCreateAccount = async (event) => {
    event.preventDefault();
    const data = {};
    data.username = username;
    data.email = email;
    data.password = password;

    const url = `${process.env.REACT_APP_THERAPYHUB_API_HOST}api/accounts`;

    const fetchConfig = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(url, fetchConfig);
    if (response.ok) {
      await login(username, password);
      setUsername("");
      setEmail("");
      setPassword("");
      navigate(`/`);
    }
  };


  useEffect(() => {
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="offset-3 col-6">
          <div className="shadow p-4 mt-4 bg2">
            <h1 className="text">Create account</h1>
            <form onSubmit={handleCreateAccount} id="create-new-client-form">
              <div className="form-floating mb-3">
                <input
                  onChange={handleUsernameChange}
                  placeholder="username"
                  required
                  type="text"
                  name="username"
                  id="username"
                  className="form-control"
                  value={username}
                />
                <label htmlFor="username">Username</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  onChange={handleEmailChange}
                  placeholder="email"
                  required
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  value={email}
                  autoComplete="username"
                />
                <label htmlFor="email">email@example.com</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  onChange={handlePasswordChange}
                  placeholder="password"
                  required
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  value={password}
                  autoComplete="email"
                />
                <label htmlFor="password">Password</label>
              </div>
              <div>
              </div>
              <p>
                {" "}
              </p>
              <div>
                <button className="btn btn-outline-info my-2 my-sm-0">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSignupForm;
